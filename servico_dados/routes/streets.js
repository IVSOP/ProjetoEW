var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var auth = require('../auth/auth')
var Street = require('../controllers/street');
var Place = require("../models/place");
var Entity = require("../models/entity");
var Date = require("../models/date");

router.get('/', auth.verificaAcesso(['USER', 'ADMIN']), function(req, res, next) {
  Street.list()
    .then(data => res.status(201).jsonp(data))
    .catch(erro => res.status(523).jsonp(erro))
});

router.get('/:id', auth.verificaAcesso(['USER', 'ADMIN']), function(req,res) {
  Street.findById(req.params.id)
    .then(data => res.status(201).jsonp(data))
    .catch(erro => res.status(522).jsonp(erro))
});

router.post('/', auth.verificaAcesso(['USER', 'ADMIN']), async function(req,res) {
  try {
    let street = req.body;

    // add userId as owner of streetObject
    const token = req.headers.authorization || req.query.token;
    const decodedToken = jwt.decode(token, {complete: true});
    const userId = decodedToken.payload.userId;
    street.owner = userId;
    street.favorits = [];

    if (street.places) {
      street.places = await validateAndConvert(street.places,Place)
    }
    if (street.entities) {
      street.entities = await validateAndConvert(street.entities, Entity)
    }
    if (street.dates) {
      street.dates = await validateAndConvert(street.dates, Date)
    }
    
    Street.insert(req.body)
      .then(data => res.status(201).jsonp(data))
      .catch(erro => res.status(527).jsonp(erro))
  } catch (error) {
    console.log(error)
    res.status(527).jsonp(error)
  }
});

router.put('/:id', auth.verificaAcesso(['USER', 'ADMIN']), async (req,res) => {
  try {

    let street = req.body;
    let data = await Street.findById(req.params.id)

    if (req.level != 'ADMIN' && req.user != data.owner){
        throw new Error('Permission denied')
    }

    if (street.places) {
      street.places = await validateAndConvert(street.places,Place)
    }

    if (street.entities) {
      street.entities = await validateAndConvert(street.entities, Entity)
    }

    if (street.dates) {
      street.dates = await validateAndConvert(street.dates, Date)
    }

    Street.updateStreet(req.params.id, req.body)
      .then(data => res.status(201).jsonp(data))
      .catch(erro => res.status(528).jsonp(erro))

  } catch (error) {
    console.log(error)
    res.status(528).jsonp(error)
  }
});

router.delete('/:id', auth.verificaAcesso(['USER', 'ADMIN']), async (req,res) => {
  try {

    let data = await Street.findById(req.params.id)

    if (req.level != 'ADMIN' && req.user != data.owner){
        throw new Error('Permission denied')
    }

    Street.deleteStreetById(req.params.id)
      .then(data => res.status(201).jsonp(data))
      .catch(erro => res.status(529).jsonp(erro))

  } catch (error) {
    console.log(error)
    res.status(529).jsonp(error)
  }
});

router.post('/favorito/:id', auth.verificaAcesso(['USER', 'ADMIN']), async (req,res) => {
    console.log(req.body)
    Street.addFavorite(req.params.id,req.body.userId)
        .then(data => res.status(201).jsonp(data))
        .catch(erro => res.status(530).jsonp(erro))
});

router.delete('/favorito/:id', auth.verificaAcesso(['USER', 'ADMIN']), async (req,res) => {
    console.log(req.body)
    Street.removeFavorite(req.params.id,req.body.userId)
        .then(data => res.status(201).jsonp(data))
        .catch(erro => res.status(530).jsonp(erro))
});

//Aux functions 
// ver se lista de entidade/data/lugar está em nomes em vez de ids. 
// Se for o caso, substituir por respetivo id da base de dados, ou criar novo se não existir
async function validateAndConvert(ids, model) {
    const validIds = [];
    for (let id of ids){
        let existingEntry = await model.findOne({ name: id }).exec(); // se já existir id correspondente para esse nome, substituir
        if (!existingEntry){
            existingEntry = await model.create({ name: id }); // senão existir id correspondente, criar novo
        }
        validIds.push(existingEntry._id);
    }
    return validIds;
}

module.exports = router;