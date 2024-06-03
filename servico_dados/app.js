var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var mongoose = require('mongoose')

var mongoDB = 'mongodb://proj_ruas_mongodb/proj_ruas'
mongoose.connect(mongoDB)
var db = mongoose.connection

db.on('error', console.error.bind(console, 'Erro de conexao ao mongodb'))

db.once('open', () => {
	console.log("Conexao ao mongodb realizada com sucesso")
})


var ruasRouter = require('./routes/streets');
var datasRouter = require('./routes/dates');
var entidadesRouter = require('./routes/entities');
var lugaresRouter = require('./routes/places');
var antigoRouter = require('./routes/antigo');
var atualRouter = require('./routes/atual');

const { exit } = require('process');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/ruas', ruasRouter);
app.use('/datas', datasRouter);
app.use('/entidades', entidadesRouter);
app.use('/lugares', lugaresRouter);
app.use('/antigo', antigoRouter);
app.use('/atual', atualRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	
  // render the error page
  res.status(err.status || 500);
  console.log(err)
  res.jsonp(JSON.stringify(err));
});

module.exports = app;
