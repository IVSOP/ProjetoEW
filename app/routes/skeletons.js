var express = require('express');
var axios = require('axios')
var router = express.Router();

// get de tudo
router.get('/', function(req, res, next) {
	axios.get('http://localhost:3000/pessoas')
	.then( (dados) => {
		res.render('pessoas', { title: 'Lista de pessoas', pessoas: dados.data });
	}).catch( (erro) => {
		res.render("error", { error: erro })
	})
});

// pagina de criar
router.get('/create', function(req, res, next) {
	res.render('pessoasCreate', { title: 'Criar pessoa' });
});

// pagina de editar
router.get('/:nome/edit', function(req, res, next) {
	let nome = req.params.nome
	axios.get('http://localhost:3000/pessoas/' + nome)
	.then( (dados) => {
		res.render('pessoasEdit', { title: 'Editar pessoa:' + nome, pessoa: dados.data[0] });
	}).catch( (erro) => {
		res.render("error", { error: erro })
	})
});

// apagar
router.get('/:nome/delete', function(req, res, next) {
	let nome = req.params.nome
	axios.delete('http://localhost:3000/pessoas/' + nome)
	.then( (dados) => {
		res.redirect('/pessoas')
	}).catch( (erro) => {
		res.render("error", { error: erro })
	})
});

// get detalhes de uma pessoa
router.get('/:nome', function(req, res, next) {
	let nome = req.params.nome
	axios.get('http://localhost:3000/pessoas/' + nome)
	.then( (dados) => {
		res.render('pessoasDetalhe', { title: 'Lista de pessoas: ' + dados.data[0].nome, pessoa: dados.data[0] });
	}).catch( (erro) => {
		res.render("error", { error: erro })
	})
});

// post de criar nova pessoa
router.post('/create', function(req, res, next) {
	// os dados do form vem formatados de forma errada, tem de se corrigir
	let pessoa = {
		nome: req.body.nome,
		idade : req.body.idade,
		morada: {
			cidade: req.body.morada_cidade,
			distrito: req.body.morada_distrito
		},
		BI: req.body.BI,
		CC: req.body.CC,
		descrição: req.body.descrição,
		profissao: req.body.profissao,
		partido_politico: {
			party_abbr: req.body.partido_politico_party_abbr,
			party_name: req.body.partido_politico_party_name
		},
		religiao: req.body.religiao,
		desportos: req.body.desportos,
		animais: req.body.animais,
		figura_publica_pt: req.body.figura_publica_pt,
		marca_carro: req.body.marca_carro,
		destinos_favoritos: req.body.destinos_favoritos,
		atributos: {
			fumador: req.body.atributos_fumador,
			gosta_cinema: req.body.atributos_gosta_cinema,
			gosta_viajar: req.body.atributos_gosta_viajar,
			acorda_cedo: req.body.atributos_acorda_cedo,
			gosta_ler: req.body.atributos_gosta_ler,
			gosta_musica: req.body.atributos_gosta_musica,
			gosta_comer: req.body.atributos_gosta_comer,
			gosta_animais_estimacao: req.body.atributos_gosta_animais_estimacao,
			gosta_dancar: req.body.atributos_gosta_dancar,
			comida_favorita: req.body.atributos_comida_favorita
		}
	}

	axios.post('http://localhost:3000/pessoas', pessoa)
	.then( resp => {
		res.render("dadosInseridos", { title: 'Dados inseridos', dados: JSON.stringify(req.body)})
	})
	.catch( erro => {
		res.render("error", { error: erro })
	})
});

// editar
router.post('/edit', function(req, res, next) {
	// os dados do form vem formatados de forma errada, tem de se corrigir
	let pessoa = {
		nome: req.body.nome,
		idade : req.body.idade,
		morada: {
			cidade: req.body.morada_cidade,
			distrito: req.body.morada_distrito
		},
		BI: req.body.BI,
		CC: req.body.CC,
		descrição: req.body.descrição,
		profissao: req.body.profissao,
		partido_politico: {
			party_abbr: req.body.partido_politico_party_abbr,
			party_name: req.body.partido_politico_party_name
		},
		religiao: req.body.religiao,
		desportos: req.body.desportos.replace('\r', '').split('\n'),
		animais: req.body.animais.replace('\r', '').split('\n'),
		figura_publica_pt: req.body.figura_publica_pt.replace('\r', '').split('\n'),
		marca_carro: req.body.marca_carro,
		destinos_favoritos: req.body.destinos_favoritos.replace('\r', '').split('\n'),
		atributos: {
			fumador: req.body.atributos_fumador,
			gosta_cinema: req.body.atributos_gosta_cinema,
			gosta_viajar: req.body.atributos_gosta_viajar,
			acorda_cedo: req.body.atributos_acorda_cedo,
			gosta_ler: req.body.atributos_gosta_ler,
			gosta_musica: req.body.atributos_gosta_musica,
			gosta_comer: req.body.atributos_gosta_comer,
			gosta_animais_estimacao: req.body.atributos_gosta_animais_estimacao,
			gosta_dancar: req.body.atributos_gosta_dancar,
			comida_favorita: req.body.atributos_comida_favorita
		}
	}

	axios.put('http://localhost:3000/pessoas/' + pessoa.nome, pessoa)
	.then( resp => {
		res.render("dadosInseridos", { title: 'Dados inseridos', dados: JSON.stringify(pessoa)})
	})
	.catch( erro => {
		res.render("error", { error: erro })
	})
});


module.exports = router;
