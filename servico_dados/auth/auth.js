var jwt = require('jsonwebtoken')
var Street = require('../controllers/street');

module.exports.verificaAcesso = function (requiredAccessLevel, requireOwnershipCheck = false) {
  return async function(req, res, next) {
      const token = req.headers.authorization || req.query.token;
      console.log("got token: ", token);

      const streetId = req.params.id

      if (token) {
          jwt.verify(token, "Proj_ruas", async function(e, payload) {
              if (e) {
                  console.log("Erro a validar token", e);
                  res.status(403).jsonp({error: e});
              } else {
                  console.log(payload)
                  // se token válido, testar nível de acesso /owner de recurso
                  const userLevel = payload.level; // nível de acesso do user
                  const userId = payload.userId;

                  if (requiredAccessLevel.includes(userLevel) || // verificar se user tem permissões compatíveis
                      (requireOwnershipCheck && 
                        await isOwner(userId))) { // se não bastar ser "user", verificar se é owner do recurso
                        console.log(">>>Permission granted");
                      next();
                  } else {
                      console.log("Previlégios insuficientes");
                      console.log(">>>Permission denied");
                      res.status(403).jsonp({error: "Previlégios insuficientes"});
                  }
              }
          });
      } else {
          console.log("Token inexistente");
          console.log(">>>Permission denied");
          res.status(403).jsonp({error: "Token inexistente!"});
      }
  };
};

//verificar se user é owner de recurso
async function isOwner(routeId, userId) {
  return Street.isOwner(routeId, userId);
}
