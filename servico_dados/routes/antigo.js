var express = require('express');
var router = express.Router();
const fs = require('fs');
// const path = require('path');
const mime = require('mime-types');
var Antigo = require('../controllers/antigo');


// rotas /show vao devolver a imagem pronta a ser mostrada


// router.get('/', function(req, res, next) {

// });

// GET para imagens atuais, devolve a imagem

router.get('/show/:id', function(req,res) {
	Antigo.findById(req.params.id)
    .then(imagem => {
		const imagePath = 'imagens/antigo/' + imagem.id + '.' + imagem.extension
		const mimetype = mime.lookup(imagePath);
		
		fs.readFile(imagePath, (err, data) => {
			if (err) {
				// If there's an error reading the file, send an error response
				res.status(500).jsonp("Error: " + err)
				return;
			}
			res.contentType(mimetype);
			res.status(201).send(data);
		});
	})
    .catch(erro => res.status(522).jsonp(erro))
});


// router.delete('/antigo/:nome', (req,res) => {
// 	fs.unlink('imagens/antigo/' + req.params.nome, (err) => {
// 		if (err) {
// 			res.status(500).jsonp("Error: " + err)
// 			return;
// 		}
// 		res.status(201).jsonp("Image deleted")
// 	})
// });

module.exports = router;
