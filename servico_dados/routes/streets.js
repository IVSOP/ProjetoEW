var express = require('express');
var router = express.Router();
var Street = require('../controllers/street');
var Place = require("../models/place");
var Entity = require("../models/entity");
var Date = require("../models/date");

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

router.post('/', async function(req,res) {
  try {
    let street = req.body;

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

router.put('/:id', async (req,res) => {
  try {
    let street = req.body;

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

router.delete('/:id', (req,res) => {
  Street.deleteStreetById(req.params.id, req.body)
  .then(data => res.status(201).jsonp(data))
  .catch(erro => res.status(529).jsonp(erro))
});

//Aux functions 

// ver se lista de entidade/data/lugar está em nomes em vez de ids. 
// Se for o caso, substituir por respetivo id da base de dados, ou criar novo se não existir
async function validateAndConvert(ids, model) {
  const validIds = [];
  for (let id of ids) {
      if (isNaN(id)) {
          let existingEntry = await model.findOne({ name: id }).exec();
          if (!existingEntry) {
              existingEntry = await model.create({ name: id });
            }
          id = existingEntry._id
      } 
      validIds.push(id);
  }
  console.log(validIds);
  return validIds;
}

module.exports = router;
