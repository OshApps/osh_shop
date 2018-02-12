var express = require('express');
var router = express.Router();
var userHelper = require('../model/user-helper');
var cartHelper = require('../model/cart-helper');

var path="/user";

var message={
    required: "This field is required.",
    passLength: "Please enter a value between 6 and 20 characters long.",
    emailExist: "The email is already in use",
    login: "The email or password is incorrect"
    };

router.use(function(req, res, next) {
    var sess = req.session;

    sess.lastUrl= sess.lastUrl || "/";

    next(); 
    });

router.post(path+"/register",function(req, res, next) {
    var sess=req.session;

    if(sess.user)
        {
        res.sendStatus(404);  
        return;    
        }

    var userQuery=req.body;

    var error=validteRegisterQuery(userQuery);
    var result={};  

    if(error === undefined)
        {
        var cookieUser=req.cookies.user;
        var userId=userHelper.createUser(userQuery.email, userQuery.password, userQuery.name, cookieUser.cartId);

        sess.user=createSessionUser(userId, userQuery.name);
                
        result.isSucceed=true;
        result.redirectUrl=sess.lastUrl;
        }
    
    result.error=error;
       
    res.send(result);
    });

router.post(path+"/login",function(req, res, next) {
    var sess=req.session;

    if(sess.user)
        {
        res.sendStatus(404);  
        return;    
        }

    var userQuery=req.body;

    var error=validteLoginQuery(userQuery);
    var result={};  

    if(error === undefined)
        {
        
        var user=userHelper.getUser(userQuery.email, userQuery.password);

        if(user)
            {   
            sess.user=createSessionUser(user.id, user.name);    
            
            updateUserCart(user, req.cookies.user);

            result.isSucceed=true;
            result.redirectUrl=sess.lastUrl;
            }else
                {
                error={}
                error.login=message.login;
                }
        }
    
    result.error=error;
       
    res.send(result);
    });

module.exports = router;

function createSessionUser(userId, userName){
    return {id:userId, name:userName}
    }

function updateUserCart(user, cookieUser){
    var cartId=cookieUser.cartId;
    
    if(user.cartId === cartId)
        {
        return;
        }

    if(cartHelper.isCartEmpty(cartId)) 
        {
        cartId=user.cartId;   
        } 
         
    if(user.cartId !== cartId)
        {
        user.cartId=cartId;
        userHelper.updateUserCart(user.id, cartId);
        }

    cookieUser.cartId=cartId;    
    }

function validteRegisterQuery(query){
    var email,password,name;
    
    if(isEmpty(query.name))
        {
        name=message.required;     
        }
    
    if(isEmpty(query.email))
        {
        email=message.required;    
        }else if(userHelper.isEmailExist(query.email))
            {
            email=message.emailExist;       
            }
    
    if(isEmpty(query.password))
        {
        password=message.required; 
        }else if(query.password.length < 6 || query.password.length > 20)
            {
            password=message.passLength;   
            }
    
    var error;

    if(email || name || password)
        {
        error={};
        error.email=email;    
        error.password=password;    
        error.name=name;     
        } 

    return error;
    }

function validteLoginQuery(query){
    var email,password;
    
    if(isEmpty(query.email))
        {
        email=message.required;    
        }
    
    if(isEmpty(query.password))
        {
        password=message.required; 
        }
    
    var error;

    if(email || password)
        {
        error={};
        error.email=email;    
        error.password=password;       
        } 

    return error;
    }

function isEmpty(str){
    return str === undefined || str.length === 0;
    }
