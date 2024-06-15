var express = require('express');
var router = express.Router();
var axios = require('axios')
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken')

router.use(cookieParser());

router.get('/', function(req, res, next){
    res.status(200).render('login', {
        title: 'Login',
        error: false,
        errorMessage: "Credenciais Inválidas"})
});

router.post('/', async function(req, res, next){
    axios.post('http://backend:3000/users/login', req.body)
        .then(resposta => {
            // const token = resposta.data.token;
            // const decoded = jwt.decode(token);
            // const userId = decoded.userId;
            
            // // se quiser criar uma cookie só com o jwt token para acesso mais fácil
            // res.cookie('userId', userId, {
            //     httpOnly: true,
            //     secure: false,
            //     maxAge: 1000 * 60 * 60 // 1 hour
            // });

            res.cookie('token', resposta.data.token, { 
                httpOnly: true, 
                secure: false, 
                maxAge: 1000 * 60 * 60}); // 1 hour
            res.redirect('/');
        })
        .catch(erro => {
            // Carregar a página de erro
            res.status(200).render('login', {
                title: 'Login',
                error: true,
                errorMessage: "Credenciais Inválidas"})
            console.error(erro)
        })
});

module.exports = router;