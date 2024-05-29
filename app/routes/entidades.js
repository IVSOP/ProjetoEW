var express = require('express');
var axios = require('axios')
var router = express.Router();


router.get('/', function(req, res, next){
    axios.get('http://localhost:3000/entidades')
        .then(response => {
            res.render('list', {
                title: 'Índice das Entidades',
                voltar: '/',
                listElements: response.data})
        })
        .catch(error => res.render('error', {error: error}))
});


module.exports = router;