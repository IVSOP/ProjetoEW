var express = require('express');
var router = express.Router();
var isLogged = require('../auth/auth');
const addTokenToHeaders = require('../auth/headerToken');
var multer = require('multer');
var upload = multer({dest: 'uploads'}) 


router.get('/', isLogged, addTokenToHeaders, function(req, res, next) {
	res.status(200).render('index', {
        title: 'Índice',
        nivel: req.level
    })
});


// Not implemented
router.post('/', isLogged, addTokenToHeaders, upload.single('importFile'), function(req, res, next) {
    console.log(req.body)
    console.log(req.file)
    res.redirect('/')
});


module.exports = router;