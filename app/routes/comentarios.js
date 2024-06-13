var express = require('express');
var axios = require('axios');   
var router = express.Router();
var isLogged = require('../auth/auth'); // verificar se user tem token de login, senão redireciona para /login
const addTokenToHeaders = require('../auth/headerToken'); // acrescentar o token ao header, para ter acesso aos recursos do backend

router.post('/:id', isLogged, addTokenToHeaders, function(req, res, next){
    console.log(req.body)
    axios.put(`http://localhost:3000/comentarios/${req.params.id}`, req.body, addTokenToHeaders)
        .then( response => {
            console.log("Comment edit submitted successfully")
            res.status(201).end()
        })
        .catch(error => {
            console.log("Error occurred while updating the comment: ", error);
            res.status(500).end()
    })
});

module.exports = router;