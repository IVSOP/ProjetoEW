var express = require('express');
var router = express.Router();
var axios = require('axios')
var cookieParser = require('cookie-parser');

router.use(cookieParser());

router.get('/', function(req, res, next){
    res.status(200).render('login', {
        title: 'Login',
        error: false,
        errorMessage: "Credenciais Inválidas"})
});

router.post('/', async function(req, res, next){
    axios.post('http://localhost:3000/users/login', req.body)
        .then(resposta => {
            res.cookie('token', resposta.data.token, { 
                httpOnly: true, 
                secure: false, 
                maxAge: 1000 * 60 * 60}); // 1 hour
            res.redirect('/');
        })
        .catch(erro => {
            res.status(501).render("error", {"error": erro})
        })
});

module.exports = router;