var express = require('express');
var router = express.Router();
var auth = require('../auth/auth')
var Place = require('../controllers/place');

router.get('/', auth.verificaAcesso(['USER', 'ADMIN']), function(req, res, next) {
  Place.list()
    .then(data => res.status(201).jsonp(data))
    .catch(erro => res.status(523).jsonp(erro))
});


router.get('/:id', auth.verificaAcesso(['USER', 'ADMIN']), function(req,res) {
  Place.findById(req.params.id)
    .then(data => res.status(201).jsonp(data))
    .catch(erro => res.status(522).jsonp(erro))
});

router.post('/', auth.verificaAcesso(['USER', 'ADMIN']), function(req,res) {
  Place.insert(req.body)
  .then(data => res.status(201).jsonp(data))
  .catch(erro => res.status(527).jsonp(erro))
});

router.put('/:id', auth.verificaAcesso(['ADMIN']), (req,res) => {
  Place.updatePlace(req.params.id, req.body)
  .then(data => res.status(201).jsonp(data))
  .catch(erro => res.status(528).jsonp(erro))
});

router.delete('/:id', auth.verificaAcesso(['ADMIN']), (req,res) => {
  Place.deletePlaceById(req.params.id, req.body)
  .then(data => res.status(201).jsonp(data))
  .catch(erro => res.status(529).jsonp(erro))
});

module.exports = router;
