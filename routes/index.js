var express = require('express');
var router = express.Router();
var extend = require('extend');
var database = require('../model/database-helper');
var categoryLayout= require('./category_layout');

var productSelect={
    cols:[database.tables.products.COL_ID, 
            database.tables.products.COL_NAME, 
            database.tables.products.COL_DESCRIPTION, 
            database.tables.products.COL_PRICE,
            database.tables.products.COL_IMG]
    };

router.use(categoryLayout);

router.get('/product/:product_id', function(req, res, next) {
    var where={};
    var productId=req.params.product_id;
    where[database.tables.products.COL_ID]=productId;

    var result=database.get(database.tables.products.TABLE_NAME, null, where);
    
    if(result.length === 0)
        {
        next();
        return;
        }

    var product=result[0];

    var localFactory=res.localFactory;

    localFactory.addLocals({product:product});

    res.render('single_product', localFactory.getLocals());
    });

router.get('/cat/:cat_id', function(req, res, next) {
    var where={};
    var catId=req.params.cat_id;
    where[database.tables.products.COL_CATID]=catId;

    var products=database.get(database.tables.products.TABLE_NAME, productSelect, where);

    if(products.length === 0)
        {
        next();
        return;
        }
    
    var localFactory=res.localFactory;

    localFactory.addLocals({products:products, selectedCatId:catId});

    res.render('index', localFactory.getLocals());
    });

router.get('/', function(req, res) {
    var localFactory=res.localFactory;
    var currLocals=localFactory.getLocals();

    var products=getRandomProducts(currLocals.categories);

    localFactory.addLocals({products:products});

    res.render('index', localFactory.getLocals());
    });

module.exports = router;

function getRandomProducts(categories){
    var select=extend(true, {}, productSelect);

    select.limit=4;

    var where={};
    where[database.tables.products.COL_ID]=function(){
        return (Math.random()*2) >= 1;
        };

    var products=[];
    var subCats,result;

    for (var catName in categories) 
        {
        subCats=categories[catName];

        for (var i = 0; i < subCats.length; i++) 
            {
            where[database.tables.products.COL_CATID]=subCats[i].id;

            result=database.get(database.tables.products.TABLE_NAME, select, where);

            products=products.concat(result);
            }
        }

    return products;
    }       