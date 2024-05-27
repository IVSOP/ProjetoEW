var express = require('express');
var router = express.Router();
var Skeleton = require("../controllers/skeleton")

router.get('/', function(req, res, next) {
	Skeleton.list()
	.then(data => {
		res.jsonp(data)
	})
	.catch(erro => {
		res.jsonp(erro)
	})
});

router.get('/:nome', function(req, res, next) {
	Skeleton.findByName(req.params.nome)
	.then(data => {
		res.jsonp(data)
	})
	.catch(erro => {
		res.jsonp(erro)
	})
});

router.post('/', function(req, res, next) {
	console.log(req.body)
	Skeleton.insert(req.body)
	.then(data => {
		res.jsonp(data)
	})
	.catch(erro => {
		res.jsonp(erro)
	})
});

router.put('/:nome', function(req, res, next) {
	Skeleton.update(req.params.nome, req.body)
	.then(data => {
		res.jsonp(data)
	})
	.catch(erro => {
		res.jsonp(erro)
	})
})

router.delete('/:nome', function(req, res, next) {
	Skeleton.deleteByName(req.params.nome)
	.then(data => {
		res.jsonp(data)
	})
	.catch(erro => {
		res.jsonp(erro)
	})
})

module.exports = router;

// para uma modalidade, tinha de construir as pessoas 1 a 1 (so tinha os seus nomes, nao todos os dados), tive de usar promises
router.get('/:modalidade', function(req, res, next) {
	Modalidade.findPessoasByDesporto(req.params.modalidade)
	.then(data => {
		if (data.length > 0) { // depois de receber os dados, ir construir os objetos das pessoas
			var final = []
			// guardar as promises
			const promises = data[0].pessoas.map(async (nome_pessoa) => {
				return Pessoa.findByName(nome_pessoa)
				.then(pessoa => {
					final.push(pessoa[0])
				})
				.catch(erro => {
					console.log(erro)
					res.jsonp(erro)
				})
			})
			// fazer um then depois de todas acabarem
			Promise.all(promises)
			.then(() => {
				final.sort((first, second) => {
					return second.nome.localeCompare(first.price)
				})
				res.jsonp(final)
			})
			.catch(erro => {
				console.log(erro);
				res.jsonp(erro);
			});
		}
	})
	.catch(erro => {
		console.log(erro)
		res.jsonp(erro)
	})
});
