var express = require('express');
var router = express.Router();
const fs = require('fs');
// const path = require('path');
const mime = require('mime-types');


// router.get('/', function(req, res, next) {

// });

// GET para imagens atuais, devolve a imagem

router.get('/atual/:nome', function(req,res) {
	const imagePath = 'imagens/atual/' + req.params.nome
	// const extension = path.extname(imagePath).toLowerCase()
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
});

// GET para imagens antigas, devolve a imagem

router.get('/antigo/:nome', function(req,res) {
	const imagePath = 'imagens/antigo/' + req.params.nome
	// const extension = path.extname(imagePath).toLowerCase()
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
