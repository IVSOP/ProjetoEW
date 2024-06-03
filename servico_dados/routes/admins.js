var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var passport = require('passport')
var userModel = require('../models/user')

// for convenience
router.post('/register', /*auth.verificaAcesso,*/ function(req, res) {
  var d = new Date().toISOString().substring(0,19)
  userModel.register(new userModel({ username: req.body.username, name: req.body.name, 
                                      level: 'ADMIN', active: true, dateCreated: d }), 
                req.body.password, 
                function(err, user) {
                  if (err) 
                    res.jsonp({error: err, message: "Register error: " + err})
                  else{
                    passport.authenticate("local")(req,res,function(){
                      jwt.sign({ username: req.user.username, level: req.user.level, 
                        sub: 'Projeto de ruas'}, 
                        "Proj_ruas",
                        {expiresIn: 3600},
                        function(e, token) {
                          if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
                          else res.status(201).jsonp({token: token})
                        });
                    })
                  }     
  })
})

module.exports = router;