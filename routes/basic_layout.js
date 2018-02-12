var express = require('express');
var router = express.Router();
var extend = require('extend');
var database = require('../model/database-helper');
var cartHelper = require('../model/cart-helper');

var defaultLocalFactory={
    locals:{
        title: "Web Store"
        },
    
    addLocals:function(locals){
        this.locals=extend(true, {}, this.locals, locals);
        },
    
    getLocals:function(){
        return this.locals;
        }
    };

module.exports = function(req,res,next){
    var cookieUser=req.cookies.user;
    
    var localFactory=extend(true, {}, defaultLocalFactory);

    var cart=cartHelper.getCart(cookieUser.cartId);

    var userName;

    if(req.session.user)
        {
        userName=req.session.user.name;  
        }

    localFactory.addLocals({cart:cart, cartProductsCount:cartHelper.getProductCount(cart), userName:userName}); // [{productId, options, qty}] --> [{productId, productName, productPrice, options, qty}]
    
    res.localFactory=localFactory;

    next();
    };


