var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var mongoose = require('mongoose')
var session = require('express-session');
const cookieParser = require('cookie-parser');

var mongoDB = 'mongodb://proj_ruas_mongodb/proj_ruas'
mongoose.connect(mongoDB, {serverSelectionTimeoutMS: 5000})
var db = mongoose.connection

db.on('error', console.error.bind(console, 'Erro de conexao ao mongodb'))

db.once('open', () => {
	console.log("Conexao ao mongodb realizada com sucesso")
})

var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var usersRouter = require('./routes/users');
var adminsRouter = require('./routes/admins');
var ruasRouter = require('./routes/streets');
var datasRouter = require('./routes/dates');
var entidadesRouter = require('./routes/entities');
var lugaresRouter = require('./routes/places');
var antigoRouter = require('./routes/antigo');
var atualRouter = require('./routes/atual');
var commentsRouter = require('./routes/comments');
var import_exportRouter = require('./routes/import_export');

const { exit } = require('process');

var app = express();

app.use(cookieParser());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure express-session middleware
app.use(session({
	secret: 'Proj_ruas',
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge: 10 * 60 * 1000 } // 10 minutes cookie time
  }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/ruas', ruasRouter);
app.use('/datas', datasRouter);
app.use('/entidades', entidadesRouter);
app.use('/lugares', lugaresRouter);
app.use('/antigo', antigoRouter);
app.use('/atual', atualRouter);
app.use('/comentarios', commentsRouter);
app.use('/users', usersRouter);
app.use('/admins', adminsRouter); // só para facilmente adicionar admins à db, pode tirar-se depois!
app.use('/impexp', import_exportRouter)

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
