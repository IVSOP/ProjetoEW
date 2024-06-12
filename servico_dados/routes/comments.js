var express = require('express');
var router = express.Router();
var auth = require('../auth/auth')
var Comment = require('../controllers/comment');
var jwt = require('jsonwebtoken')

router.get('/', auth.verificaAcesso(['USER', 'ADMIN']), function(req, res, next) {
  Comment.list()
    .then(data => res.status(201).jsonp(data))
    .catch(erro => res.status(523).jsonp(erro))
});

router.get('/:id', auth.verificaAcesso(['USER', 'ADMIN']), function(req,res) {
  Comment.findById(req.params.id)
    .then(data => res.status(201).jsonp(data))
    .catch(erro => res.status(522).jsonp(erro))
});

router.get('/ruas/:id', auth.verificaAcesso(['USER', 'ADMIN']),function(req,res) {
  Comment.findByStreet(req.params.id)
  .then(data => res.status(201).jsonp(data))
  .catch(erro => res.status(522).jsonp(erro))
});

router.post('/', auth.verificaAcesso(['USER', 'ADMIN']), function(req,res) {
  console.log(req.body)
  // add userId as owner of comment
  const token = req.headers.authorization || req.query.token;
  const decodedToken = jwt.decode(token, {complete: true});
  const userId = decodedToken.payload.userId;

  const comment = {
    streetId: req.body.streetId,
    owner: userId,
    text: req.body.text,
    createdAt: new Date(),
    updatedAt: null,
    like: [],
    dislike: []
  };

  Comment.insert(comment)
  .then(data => res.status(201).jsonp(data))
  .catch(erro => res.status(527).jsonp(erro))
});

router.post('/:id/respostas', auth.verificaAcesso(['USER', 'ADMIN']), async (req, res) => {
    // add userId as owner of comment
    const token = req.headers.authorization || req.query.token;
    const decodedToken = jwt.decode(token, {complete: true});
    const userId = decodedToken.payload.userId;

    const comment = {
      streetId: req.body.streetId,
      owner: userId,
      text: req.body.text,
      baseCommentId: req.params.id,
      createdAt: new Date(),
      updatedAt: null,
      like: [],
      dislike: []
    };

    Comment.insert(comment)
    .then(data => res.status(201).jsonp(data))
    .catch(error => {
      console.log(error)
      res.status(527).jsonp(error)
    })
});

router.put('/:id/gostos', auth.verificaAcesso(['USER', 'ADMIN']), async (req, res) => {
  // add userId as owner of comment
  const token = req.headers.authorization || req.query.token;
  const decodedToken = jwt.decode(token, {complete: true});
  const userId = decodedToken.payload.userId;

  Comment.addLike(req.params.id, userId)
  .then(data => res.status(201).jsonp(data))
  .catch(error => {
    console.log(error)
    res.status(529).jsonp(error)
  })
});

router.put('/:id/desgostos', auth.verificaAcesso(['USER', 'ADMIN']), async (req, res) => {
  // add userId as owner of comment
  const token = req.headers.authorization || req.query.token;
  const decodedToken = jwt.decode(token, {complete: true});
  const userId = decodedToken.payload.userId;

  Comment.addDislike(req.params.id, userId)
  .then(data => res.status(201).jsonp(data))
  .catch(error => {
    console.log(error)
    res.status(529).jsonp(error)
  })
});

router.put('/:id', auth.verificaAcesso([],true), async (req,res) => {

  const comment = {
    text: req.body.text,
    updatedAt: Date.now()
  }

  Comment.updateComment(req.params.id, comment)
  .then(data => res.status(201).jsonp(data))
  .catch(erro => res.status(528).jsonp(erro))
});

router.delete('/:id', auth.verificaAcesso(['ADMIN'],true), (req,res) => {
  Comment.deleteCommentById(req.params.id, req.body)
  .then(data => res.status(201).jsonp(data))
  .catch(erro => res.status(529).jsonp(erro))
});

module.exports = router;
