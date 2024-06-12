var express = require('express');
var router = express.Router();
var isLogged = require('../auth/auth');
const addTokenToHeaders = require('../auth/headerToken');
var fs = require('fs');
var axios = require('axios');
var multer = require('multer');
var FormData = require('form-data');
var upload = multer({dest: 'uploads'}) 


router.get('/', isLogged, addTokenToHeaders, function(req, res, next) {

    if (req.query.exportar){

        // Não colocar tokens no pedido
        axios.get('http://localhost:3000/impexp/exportar', {responseType: 'arraybuffer'},)
            .then(response => {

                let fileName = 'dados.tar.gz';
                fs.writeFileSync(fileName, Buffer.from(response.data,'binary'));

                res.download(fileName, (error) => {
                    if (error) throw new Error(error)
                    else fs.unlinkSync(fileName)
                })
            })
            .catch(error => res.render('error', {error: error}))
    }

    else{
        res.status(200).render('index', {
            title: 'Índice',
            nivel: req.level
        })
    }
});


router.post('/', isLogged, addTokenToHeaders, upload.single('importFile'), function(req, res, next) {

    const formData = new FormData()
    const data = fs.readFileSync(req.file.path)
    formData.append('dados', data, req.file.originalname)

    axios.post(`http://localhost:3000/impexp/importar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }})
        .then(() => {
            fs.unlinkSync(req.file.path)
            res.redirect('/')
        })
        .catch(error => res.render('error', {error: error}))
});


module.exports = router;