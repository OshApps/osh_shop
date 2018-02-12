var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var url = require('url');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var secret=Math.random().toString(36).substring(2);
var hour=1000 * 60 * 60;

app.use(session({ secret: secret, 
                  cookie: { maxAge: hour }, 
                  resave: false, 
                  saveUninitialized: true,}));


var user = require('./routes/user');
var cart = require('./routes/cart');
var index = require('./routes/index');
var login = require('./routes/login');
var register = require('./routes/register');
var error = require('./routes/error');

app.use(user);
app.use(cart);

function redirectLoggedUsers(req, res, next){
    var sess = req.session;

    if(sess.user)
        {
        res.redirect("/");
        return;        
        }

    next();
    }

app.use('/login', redirectLoggedUsers, login);
app.use('/register', redirectLoggedUsers, register);

function updateLastUrl(req, res, next){
    req.session.lastUrl=req.url;

    next();
    }

app.use('/', updateLastUrl, index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
    });

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
    });

module.exports = app;
