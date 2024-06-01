var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next){
    res.status(200).render('auth', {
        title: 'Login',
        error: false,
        errorMessage: "Credenciais Inválidas"})
});


// Not implemented
router.post('/', function(req, res, next){
    console.log(req.body)
    res.status(201).end()
});


module.exports = router;