var express = require('express');
var router = express.Router();
var basicLayout= require('./basic_layout');

router.use(basicLayout);

router.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', res.localFactory.getLocals());
    });

module.exports = router;
