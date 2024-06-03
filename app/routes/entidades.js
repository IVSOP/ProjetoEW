var express = require('express');
var axios = require('axios');
var router = express.Router();
var isLogged = require('../auth/auth');
const addTokenToHeaders = require('../auth/headerToken');

router.get('/', isLogged, addTokenToHeaders, function(req, res, next){
    axios.get('http://localhost:3000/entidades')
        .then(response => {
            res.status(200).render('collapsedList', {
                title: 'Índice das Entidades',
                listElements: response.data})
        })
        .catch(error => res.status(500).render('error', {error: error}))
});


module.exports = router;