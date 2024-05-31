var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next){
    res.status(200).render('auth', {title: 'Registar'})
});


module.exports = router;