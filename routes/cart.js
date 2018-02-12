var express = require('express');
var router = express.Router();
var cartHelper = require('../model/cart-helper');

var path="/cart";

var year=1000 * 60 * 60 * 24 * 30 * 12;

router.use(function(req, res, next) {
    var cookies=req.cookies;
    
    if(!cookies.user)
        {
        var cartId=cartHelper.createCart();
        var cookieUser={cartId:cartId};

        updateCookieUser(res, cookieUser);
        req.cookies.user=cookieUser;
        }
    
    next();  
    });

router.post(path+"/add", function(req, res, next) {
    var cookieUser=req.cookies.user;

    var error = changeCart(req.body, function(product){
        cartHelper.addProduct(cookieUser.cartId, product); 
        });
        
    var result={};  

    if(error === undefined)
        {
        result.cart=cartHelper.getCart(cookieUser.cartId);
        }
    
    result.error=error;
       
    res.send(result);
    });

router.get(path+"/update", function(req, res, next) {
    var cookieUser=req.cookies.user;

    var error = changeCart(req.query, function(product){
        cartHelper.addProduct(cookieUser.cartId, product); 
        });
        
    var result={};  

    result.isUpdated=(error === undefined);
    result.error=error;
       
    res.send(result);
    });

router.get(path+"/delete", function(req, res, next) {
    var cookieUser=req.cookies.user;
    
    var error = changeCart(req.query, function(product){
        cartHelper.removeProduct(cookieUser.cartId, product);  
        });
         
    var result={};  

    result.isDeleted=(error === undefined);
    result.error=error;
       
    res.send(result);
    });

module.exports = router;

function updateCookieUser(res,user){
    res.cookie('user',user, { maxAge: year, httpOnly: true });
    }

function getParams(query){
    return JSON.parse(query.params);
    }

function getProductParams(query){
    var params=getParams(query);
    return params.product;
    }

function changeCart(query, action){
    var error;

    try {
        var product=getProductParams(query);
        action(product);
        } catch (err)
            {
            console.log(err.stack);
            error=err.message;    
            }
        
    return error;
    }