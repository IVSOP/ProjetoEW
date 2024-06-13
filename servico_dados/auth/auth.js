var jwt = require('jsonwebtoken')
var Street = require('../controllers/street');
var StreetModel = require("../models/street")

module.exports.verificaAcesso = function (requiredAccessLevel, requireOwnershipCheck = false, objectModel= StreetModel) {
  return async function(req, res, next) {
      try {
        const token = req.headers.authorization || req.query.token;
        console.log("got token: ", token);

        
        if (!token) {
            console.log("Token inexistente");
            console.log(">>>Permission denied");
            res.status(403).jsonp({error: "Token inexistente!"});
        }
        
        const payload = await jwtVerify(token, "Proj_ruas");
        
        const userLevel = payload.level; // nível de acesso do user
        const userId = payload.userId;
        const objectId = req.params.id

        const hasRequiredAcess = requiredAccessLevel.includes(userLevel)
        const isOwnerOfResource = requireOwnershipCheck ? await isOwner(objectId, userId, objectModel) : true
        if (hasRequiredAcess || isOwnerOfResource) { // se não bastar ser "user", verificar se é owner do recurso
            console.log(">>>Permission granted");
            req.user = userId;
            req.level = userLevel;
            next();
        } else {
            console.log("Previlégios insuficientes");
            console.log(">>>Permission denied");
            res.status(403).jsonp({error: "Previlégios insuficientes"});
        }
    } catch (error) {
        console.log("Error verifying access permission: " + error)
        res.status(403).jsonp("Error verifying access permission: " + error)
    }
  };
};

const jwtVerify = (token, secret) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  };

//verificar se user é owner de recurso
async function isOwner(objectId, userId, objectModel) {
  return Street.isOwner(objectId, userId, objectModel);
}
