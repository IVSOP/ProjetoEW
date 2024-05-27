var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

var mongoose = require('mongoose')
var mongodb = 'mongodb://127.0.0.1/skeleton' // ############################################################3
mongoose.connect(mongodb)
var db = mongoose.connection
db.on('error', console.error.bind(console, 'Erro de conexao ao mongodb'))
db.once('open', () => {
	console.log("Conexao ao mongodb realizada com sucesso")
})


var skeletonRouter = require('./routes/skeletons'); // ############################################################
const { exit } = require('process');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/skeleton', skeletonRouter); // ############################################################3

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
	res.jsonp('error');
});

module.exports = app;
