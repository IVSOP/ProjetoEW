var express = require('express');
var axios = require('axios');   
var multer = require('multer');
var router = express.Router();
var upload = multer({dest: 'uploads'}) 


router.get('/', function(req, res, next){
    axios.get('http://localhost:3000/ruas')
        .then(response => {
            res.status(200).render('streetList', {
                title: 'Índice das Ruas',
                ruas: response.data})
        })
        .catch(error => res.status(500).render('error', {error: error}))
});


// Not implemented
router.get('/eliminar/:id', function(req, res, next){
    console.log(req.params.id)
    res.status(200).end()
});


// Not implemented
router.get('/registar', function(req, res, next){
    res.status(200).render('streetCreationForm', {title: 'Registar - Rua'})
})


// Not implemented
router.post('/registar', upload.fields([{ name: 'oldImageFiles' }, { name: 'newImageFiles' }]), function(req, res, next) {
    console.log(req.body);
    console.log(req.files);
    res.status(201).end();
});


router.get('/editar/:id', function(req, res, next){
    axios.get('http://localhost:3000/ruas/' + req.params.id)
        .then(async response => {

            datas = (await axios.get('http://localhost:3000/datas')).data
            lugares = (await axios.get('http://localhost:3000/lugares')).data
            entidades = (await axios.get('http://localhost:3000/entidades')).data
            
            res.status(200).render('streetUpdateForm', {
                title: 'Editar - ' + req.params.id,
                datas: datas.filter(x => response.data.dates.includes(x['_id'])),
                lugares: lugares.filter(x => response.data.places.includes(x['_id'])),
                entidades: entidades.filter(x => response.data.entities.includes(x['_id'])),
                rua: response.data})
        })
        .catch(error => res.status(500).render('error', {error: error}))
})


// Not implemented
router.post('/editar/:id', upload.fields([{ name: 'oldImageFiles' }, { name: 'newImageFiles' }]), function(req, res, next){
    console.log(req.body)
    console.log(req.files)
    res.status(201).end()
})


router.get('/:id', function(req, res, next){
    axios.get('http://localhost:3000/ruas/' + req.params.id)
        .then(async response => {

            datas = (await axios.get('http://localhost:3000/datas')).data
            lugares = (await axios.get('http://localhost:3000/lugares')).data
            entidades = (await axios.get('http://localhost:3000/entidades')).data

            res.status(200).render('street', {
                title: response.data.name,
                datas: datas.filter(x => response.data.dates.includes(x['_id'])),
                lugares: lugares.filter(x => response.data.places.includes(x['_id'])),
                entidades: entidades.filter(x => response.data.entities.includes(x['_id'])),
                rua: response.data})
        })
        .catch(error => res.status(500).render('error', {error: error}))
});


// Not implemented
router.post('/comentarios/:id', function(req, res, next){
    console.log(req.body)
    res.status(201).end()
});


module.exports = router;