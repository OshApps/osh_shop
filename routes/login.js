var express = require('express');
var router = express.Router();
var basicLayout= require('./basic_layout');

router.use(basicLayout);

router.get('/', function(req, res, next) {
    res.render('login', res.localFactory.getLocals());
    });

module.exports = router;
