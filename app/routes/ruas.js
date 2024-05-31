var express = require('express');
var axios = require('axios');   
var multer = require('multer');
var router = express.Router();

var upload = multer({dest: 'uploads'}) 


router.get('/', function(req, res, next){
    axios.get('http://localhost:3000/ruas')
        .then(response => {
            res.status(200).render('list', {
                title: 'Índice das Ruas',
                listElements: response.data})
        })
        .catch(error => res.status(500).render('error', {error: error}))
});


router.get('/registar', function(req, res, next){
    res.status(201).render('streetCreationForm', {title: 'Registar - Rua'})
})


router.post('/registar', upload.fields([{ name: 'oldImageFiles' }, { name: 'newImageFiles' }]), function(req, res, next) {
    console.log(req.body);
    console.log(req.files);
    res.end();
});


router.get('/editar/:id', function(req, res, next){
    axios.get('http://localhost:3000/ruas/' + req.params.id)
        .then(response => {
            res.status(202).render('streetUpdateForm', {
                title: 'Editar - ' + req.params.id,
                rua: response.data})
        })
        .catch(error => res.status(502).render('error', {error: error}))
})


router.post('/editar/:id', function(req, res, next){
    console.log(req.body)
    res.status(333).end()
})



router.get('/:id', function(req, res, next){
    axios.get('http://localhost:3000/ruas/' + req.params.id)
        .then(async response => {

            datas = (await axios.get('http://localhost:3000/datas')).data
            lugares = (await axios.get('http://localhost:3000/lugares')).data
            entidades = (await axios.get('http://localhost:3000/entidades')).data
            imagens_atuais = []
            imagens_antigas = []

            response.data.old_images.forEach(x => {
                x.path = x.path.split('/').pop(),
                imagens_antigas.push(x)
            });

            response.data.new_images.forEach(x => {
                imagens_atuais.push(x.split('/').pop())
            });

            res.status(203).render('street', {
                title: response.data.name,
                datas: datas.filter(x => response.data.dates.includes(x['_id'])),
                lugares: lugares.filter(x => response.data.places.includes(x['_id'])),
                entidades: entidades.filter(x => response.data.entities.includes(x['_id'])),
                imagens_antigas: imagens_antigas,
                imagens_atuais: imagens_atuais,
                rua: response.data})
        })
        .catch(error => res.status(503).render('error', {error: error}))
});


module.exports = router;