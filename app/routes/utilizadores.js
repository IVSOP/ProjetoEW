var express = require('express');
var router = express.Router();
var isLogged = require('../auth/auth');
const addTokenToHeaders = require('../auth/headerToken');
var axios = require('axios');


router.get('/:id', isLogged, addTokenToHeaders, function(req, res, next) {

    axios.get(`http://localhost:3000/users/${req.params.id}`, addTokenToHeaders)
        .then(response => res.render('user',{
                title: response.data.username,
                utilizador: response.data
            }))
        .catch(error => res.render('error', {error: error}))
})


module.exports = router;