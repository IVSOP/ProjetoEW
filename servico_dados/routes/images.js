var express = require('express');
var router = express.Router();
const fs = require('fs');
// const path = require('path');
const mime = require('mime-types');


// router.get('/', function(req, res, next) {

// });

router.post('/atual/:nome', function(req,res) {
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


// router.put('/:id', (req,res) => {
//   Entity.updateEntity(req.params.id, req.body)
//   .then(data => res.status(201).jsonp(data))
//   .catch(erro => res.status(528).jsonp(erro))
// });

// router.delete('/:id', (req,res) => {
//   Entity.deleteEntityById(req.params.id, req.body)
//   .then(data => res.status(201).jsonp(data))
//   .catch(erro => res.status(529).jsonp(erro))
// });

module.exports = router;
