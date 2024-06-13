var express = require('express');
var router = express.Router();
var isLogged = require('../auth/auth');
const addTokenToHeaders = require('../auth/headerToken');
var axios = require('axios');


router.get('/:id', isLogged, addTokenToHeaders, function(req, res, next) {

    axios.get(`http://localhost:3000/users/${req.params.id}`, addTokenToHeaders)
        .then(async response => {

            ruas =  (await axios.get(`http://localhost:3000/ruas`, addTokenToHeaders)).data
            ruas = ruas.filter(x => x.favorites.includes(req.params.id))

            comentarios =  (await axios.get(`http://localhost:3000/comentarios`, addTokenToHeaders)).data
            comentarios = comentarios.filter(x => x.owner == req.params.id)

            for (let comentario of comentarios){
                street = await axios.get(`http://localhost:3000/ruas/${comentario.streetId}`, addTokenToHeaders)
                comentario['streetName'] = street.data.name
            }

            res.render('user',{
                title: response.data.username,
                ruas: ruas,
                comentarios: comentarios,
                utilizador: response.data})
        })
        .catch(error => res.render('error', {error: error}))
})


module.exports = router;