var express = require('express');
var axios = require('axios');   
var multer = require('multer');
var router = express.Router();
var upload = multer({dest: 'uploads'}) 
var isLogged = require('../auth/auth'); // verificar se user tem token de login, senão redireciona para /login
const addTokenToHeaders = require('../auth/headerToken'); // acrescentar o token ao header, para ter acesso aos recursos do backend

router.get('/', isLogged, addTokenToHeaders, function(req, res, next){
    axios.get('http://localhost:3000/ruas')
        .then(response => {
            res.status(200).render('streetList', {
                title: 'Índice das Ruas',
                ruas: response.data})
        })
        .catch(error => res.status(500).render('error', {error: error}))
});

// Not implemented
router.get('/eliminar/:id', isLogged, addTokenToHeaders, function(req, res, next){
    console.log(req.params.id)
    res.status(200).end()
});

// Not implemented
router.get('/registar', isLogged, addTokenToHeaders, function(req, res, next){
    res.status(200).render('streetCreationForm', {title: 'Registar - Rua'})
})

// Not implemented
router.post('/registar', isLogged, addTokenToHeaders, upload.fields([{ name: 'oldImageFiles' }, { name: 'newImageFiles' }]), function(req, res, next) {
    console.log(req.body);
    console.log(req.files);
    res.status(201).end();
});


router.get('/editar/:id', isLogged, addTokenToHeaders, function(req, res, next){
    axios.get('http://localhost:3000/ruas/' + req.params.id)
        .then(async response => {

            imagens_antigas = []
            imagens_atuais = []
            datas = (await axios.get('http://localhost:3000/datas', addTokenToHeaders)).data
            lugares = (await axios.get('http://localhost:3000/lugares', addTokenToHeaders)).data
            entidades = (await axios.get('http://localhost:3000/entidades', addTokenToHeaders)).data

            for (const x of response.data.old_images)
                imagens_antigas.push((await axios.get(`http://localhost:3000/antigo/${x['_id']}`, addTokenToHeaders)).data);

            for (const x of response.data.new_images)
                imagens_atuais.push((await axios.get(`http://localhost:3000/atual/${x['_id']}`, addTokenToHeaders)).data);

            res.status(200).render('streetUpdateForm', {

                title: 'Editar - ' + req.params.id,
                datas: datas.filter(x => response.data.dates.includes(x['_id'])),
                lugares: lugares.filter(x => response.data.places.includes(x['_id'])),
                entidades: entidades.filter(x => response.data.entities.includes(x['_id'])),
                imagens_antigas: imagens_antigas,
                imagens_atuais: imagens_atuais,
                rua: response.data,
                token: req.cookies.token
            })
        })
        .catch(error => res.status(500).render('error', {error: error}))
})


// Not implemented
router.post('/editar/:id', isLogged, addTokenToHeaders, upload.fields([{ name: 'oldImageFiles' }, { name: 'newImageFiles' }]), function(req, res, next){
    console.log(req.body)
    console.log(req.files)
    res.status(201).end()
})


router.get('/:id', isLogged, addTokenToHeaders, function(req, res, next){
    axios.get('http://localhost:3000/ruas/' + req.params.id)
        .then(async response => {

            imagens_antigas = []
            imagens_atuais = []
            datas = (await axios.get('http://localhost:3000/datas', addTokenToHeaders)).data
            lugares = (await axios.get('http://localhost:3000/lugares', addTokenToHeaders)).data
            entidades = (await axios.get('http://localhost:3000/entidades', addTokenToHeaders)).data

            for (const x of response.data.old_images)
                imagens_antigas.push((await axios.get(`http://localhost:3000/antigo/${x['_id']}`, addTokenToHeaders)).data);

            for (const x of response.data.new_images)
                imagens_atuais.push((await axios.get(`http://localhost:3000/atual/${x['_id']}`, addTokenToHeaders)).data);

            res.status(200).render('street', {
                title: response.data.name,
                datas: datas.filter(x => response.data.dates.includes(x['_id'])),
                lugares: lugares.filter(x => response.data.places.includes(x['_id'])),
                entidades: entidades.filter(x => response.data.entities.includes(x['_id'])),
                imagens_antigas: imagens_antigas,
                imagens_atuais: imagens_atuais,
                rua: response.data,
                token: req.cookies.token
            })
        })
        .catch(error => res.status(500).render('error', {error: error}))
});


// Not implemented
router.post('/comentarios/:id', isLogged, addTokenToHeaders, function(req, res, next){
    console.log(req.body)
    res.status(201).end()
});


module.exports = router;