var express = require('express');
var axios = require('axios');   
var multer = require('multer');
var router = express.Router();
var upload = multer({dest: 'uploads'}) 
const Utils = require('../forms/rua.js')
var isLogged = require('../auth/auth'); // verificar se user tem token de login, senão redireciona para /login
const addTokenToHeaders = require('../auth/headerToken'); // acrescentar o token ao header, para ter acesso aos recursos do backend

router.get('/', isLogged, addTokenToHeaders, function(req, res, next){
    axios.get('http://localhost:3000/ruas', addTokenToHeaders)
        .then(response => {
            res.status(200).render('streetList', {
                title: 'Índice das Ruas',
                nivel: req.level,
                ruas: response.data})
        })
        .catch(error => res.status(500).render('error', {error: error}))
});

router.get('/eliminar/:id', isLogged, addTokenToHeaders, function(req, res, next){
    axios.delete(`http://localhost:3000/ruas/${req.params.id}`, addTokenToHeaders)
        .then(() => res.redirect('/ruas'))
        .catch(error => res.status(500).render('error', {error, error}))
});

router.get('/registar', isLogged, addTokenToHeaders, function(req, res, next){
    res.status(200).render('streetCreationForm', {title: 'Registar - Rua'})
})

router.post('/registar', isLogged, addTokenToHeaders, upload.fields([{ name: 'oldImageFiles' }, { name: 'newImageFiles' }]), function(req, res, next) {
    Utils.postImagens(req.body.oldImageSubst,req.files.oldImageFiles,'antigo')
        .then(async ids_imagens_antigas => {

            var formData = Utils.getRuaForm(req)
            formData['old_images'] = ids_imagens_antigas
            formData['new_images'] = await Utils.postImagens(
                req.body.newImageSubst,
                req.files.newImageFiles,
                'atual')

            axios.post('http://localhost:3000/ruas/', formData, addTokenToHeaders)
                .then(() => res.redirect('/ruas'))
                .catch(error => res.status(500).render('error', {error: error}))
        })
        .catch(error => res.render('error', {error: error}))
});

router.get('/editar/:id', isLogged, addTokenToHeaders, function(req, res, next){
    axios.get(`http://localhost:3000/ruas/${req.params.id}`, addTokenToHeaders)
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

router.post('/editar/:id', isLogged, addTokenToHeaders, upload.fields([{ name: 'oldImageFiles' }, { name: 'newImageFiles' }]), function(req, res, next){
    
    axios.get(`http://localhost:3000/ruas/${req.params.id}`, addTokenToHeaders)
        .then(async response => {

            var formData = Utils.getRuaForm(req)
            
            formData.old_images = formData.old_images.concat(
                await Utils.postImagens(
                    req.body.oldImageSubst,
                    req.files.oldImageFiles,
                    'antigo'))
            
            formData.new_images = formData.new_images.concat(
                await Utils.postImagens(
                    req.body.newImageSubst,
                    req.files.newImageFiles,
                    'atual'))

            await Utils.deleteImageIfNotContains(
                response.data.old_images,
                formData.old_images,
                'antigo')

            await Utils.deleteImageIfNotContains(
                response.data.new_images,
                formData.new_images,
                'atual'
            )

            await Utils.updateImagens(req.body.oldImageSubst,req.body.oldImageFiles,'antigo')
            await Utils.updateImagens(req.body.newImageSubst,req.body.newImageFiles,'atual')

            axios.put(`http://localhost:3000/ruas/${req.params.id}`, formData, addTokenToHeaders)
                .then(() => res.redirect('/ruas/' + req.params.id))
                .catch(error => res.status(500).render('error', {error: error}))
        })
        .catch(error => res.status(500).render('error', {error: error}))
})


router.get('/:id', isLogged, addTokenToHeaders, function(req, res, next){
    axios.get(`http://localhost:3000/ruas/${req.params.id}`, addTokenToHeaders)
        .then(async response => {

            imagens = []
            datas = (await axios.get('http://localhost:3000/datas', addTokenToHeaders)).data
            lugares = (await axios.get('http://localhost:3000/lugares', addTokenToHeaders)).data
            entidades = (await axios.get('http://localhost:3000/entidades', addTokenToHeaders)).data

            for (let imagem of response.data.old_images){
                let imagem_data = (await axios.get(`http://localhost:3000/antigo/${imagem['_id']}`, addTokenToHeaders)).data
                imagem_data['route'] = 'antigo'
                imagens.push(imagem_data);
            }

            for (let imagem of response.data.new_images){
                let imagem_data = (await axios.get(`http://localhost:3000/atual/${imagem['_id']}`, addTokenToHeaders)).data
                imagem_data['route'] = 'atual' 
                imagens.push(imagem_data);
            }

            res.status(200).render('street', {
                title: response.data.name,
                datas: datas.filter(x => response.data.dates.includes(x['_id'])),
                lugares: lugares.filter(x => response.data.places.includes(x['_id'])),
                entidades: entidades.filter(x => response.data.entities.includes(x['_id'])),
                imagens: imagens,
                rua: response.data,
                nivel: req.level,
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