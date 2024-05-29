var express = require('express');
var router = express.Router();
var Street = require('../controllers/street');

router.get('/', function(req, res, next) {
  Street.list()
    .then(data => res.status(201).jsonp(data))
    .catch(erro => res.status(523).jsonp(erro))
});


router.get('/:id', function(req,res) {
  Street.findById(req.params.id)
    .then(data => res.status(201).jsonp(data))
    .catch(erro => res.status(522).jsonp(erro))
});

router.post('/', function(req,res) {
  Street.insert(req.body)
  .then(data => res.status(201).jsonp(data))
  .catch(erro => res.status(527).jsonp(erro))
});

router.put('/:id', (req,res) => {
  Street.updateStreet(req.params.id, req.body)
  .then(data => res.status(201).jsonp(data))
  .catch(erro => res.status(528).jsonp(erro))
});

router.delete('/:id', (req,res) => {
  Street.deleteStreetById(req.params.id, req.body)
  .then(data => res.status(201).jsonp(data))
  .catch(erro => res.status(529).jsonp(erro))
});

module.exports = router;
