var express = require('express');
var router = express.Router();
var isLogged = require('../auth/auth');
const addTokenToHeaders = require('../auth/headerToken');
var fs = require('fs');
var axios = require('axios');
var multer = require('multer');
const mime = require('mime-types');
var FormData = require('form-data');
var upload = multer({dest: 'uploads'}) 


router.get('/', isLogged, addTokenToHeaders, function(req, res, next) {
    res.status(200).render('index', {
        title: 'Índice',
        utilizador: req.user,
        permissao: req.level == 'ADMIN'
    })
});


router.get('/logout', isLogged, addTokenToHeaders, function(req, res, next) {
    res.cookie('token', '', { maxAge: 0 })
    res.redirect('/login')
});


router.post('/importar', isLogged, addTokenToHeaders, upload.single('importFile'), function(req, res, next) {

    const formData = new FormData()
    const data = fs.readFileSync(req.file.path)
    formData.append('import_file', data, req.file.originalname)

    axios.post('http://localhost:3000/impexp/importar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }})
        .then(() => {
            fs.unlinkSync(req.file.path)
            res.status(200).end()
        })
        .catch(() => res.status(500).end())
});


router.get('/exportar', isLogged, addTokenToHeaders, function(req, res, next) {

    axios.get('http://localhost:3000/impexp/exportar', {responseType: 'arraybuffer'},)
        .then(response => {

            let fileName = `dados.${mime.extension(response.headers.get('content-type'))}`;
            fs.writeFileSync(fileName, Buffer.from(response.data,'binary'));

            res.download(fileName, (error) => {
                if (error) throw new Error(error)
                else fs.unlinkSync(fileName)
            })
        })
        .catch(error => res.render('error', {error: error}))
});


module.exports = router;