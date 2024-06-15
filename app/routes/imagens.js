var express = require('express');
var axios = require('axios');
var router = express.Router(); 
var isLogged = require('../auth/auth');
const addTokenToHeaders = require('../auth/headerToken');


router.get('/:folder/:id', isLogged, addTokenToHeaders, function(req, res, next) {
    axios.get(`http://backend:3000/${req.params.folder}/show/${req.params.id}`, { responseType: 'arraybuffer' })
        .then(response => {
            res.contentType(response.headers.get('content-type'))
            res.status(201).send(response.data)
        })
        .catch(error => res.status(500).jsonp(error))
});


module.exports = router;