var express = require('express');
var router = express.Router();
var database = require('../model/database-helper');
var basicLayout= require('./basic_layout');

router.use(basicLayout);

router.use(function(req, res, next) {
    var locals={
        categories:getCategories()
        };
    
    res.localFactory.addLocals(locals);

    next();
    });

module.exports = router;

function getCategories(){
    var result=database.get(database.tables.categories.TABLE_NAME);
    var categories={};
    var cat,catName,subCat;

    for (var i = 0; i < result.length; i++) 
        {
        cat=result[i];
        catName=cat[database.tables.categories.COL_CAT];

        categories[catName]=categories[catName] || [];

        subCat={
            id: cat[database.tables.categories.COL_ID],
            name: cat[database.tables.categories.COL_SUBCAT],
            };

        categories[catName].push(subCat);
        }

    return categories;
    }

