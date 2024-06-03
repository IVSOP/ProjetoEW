var express = require('express');
var router = express.Router();
var isLogged = require('../auth/auth');
const addTokenToHeaders = require('../auth/headerToken');

router.get('/', isLogged, addTokenToHeaders, function(req, res, next) {
	res.status(200).render('index', { title: 'Índice' })
});


module.exports = router;