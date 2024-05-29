var express = require('express');
var axios = require('axios')
var router = express.Router();


router.get('/', function(req, res, next){
    axios.get('http://localhost:3000/ruas')
        .then(response => {
            res.render('list', {
                title: 'Índice das Ruas',
                voltar: '/',
                listElements: response.data})
        })
        .catch(error => res.render('error', {error: error}))
});


router.get('/:id', function(req, res, next){
    axios.get('http://localhost:3000/ruas/' + req.params.id)
        .then(async response => {

            datas = (await axios.get('http://localhost:3000/datas')).data
            lugares = (await axios.get('http://localhost:3000/lugares')).data
            entidades = (await axios.get('http://localhost:3000/entidades')).data

            res.render('street', {
                title: response.data.name,
                datas: datas.filter(x => response.data.dates.includes(x['_id'])),
                lugares: lugares.filter(x => response.data.places.includes(x['_id'])),
                entidades: entidades.filter(x => response.data.entities.includes(x['_id'])),
                rua: response.data})
        })
        .catch(error => res.render('error', {error: error}))
});


module.exports = router;