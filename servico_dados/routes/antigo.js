var express = require('express');
var router = express.Router();
const fs = require('fs');
// const path = require('path');
const mime = require('mime-types');
var Antigo = require('../controllers/antigo');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/antigo' })

// rotas /show vao devolver a imagem pronta a ser mostrada


// router.get('/', function(req, res, next) {

// });

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

router.post('/', upload.single('imagem'), function(req,res) {

	dados_imagem = {
		// id so vai ser criado na BD
		subst: req.body.subst,
		extension: req.file.originalname.split('.').pop()
	}

	Antigo.insert(dados_imagem)
	.then(imagem => {
		// mover imagem para a dir correta
		fs.rename(req.file.path, "imagens/antigo/" + imagem._id + '.' + imagem.extension, function(error){
			if(error) throw error
		})

		res.status(201).jsonp(imagem);
	})
	.catch(erro => res.status(522).jsonp(erro))
});

router.delete('/:id', function(req,res) {
	Antigo.deleteById(req.params.id)
    .then(imagem => {
		fs.unlink('imagens/antigo/' + imagem._id + '.' + imagem.extension, (err) => {
			if (err) {
				res.status(500).jsonp("Error: " + err)
				return;
			}
			// res.status(201).jsonp("Image deleted")
		})
		res.status(201).jsonp(imagem);
	})
    .catch(erro => res.status(522).jsonp(erro))
});

module.exports = router;
