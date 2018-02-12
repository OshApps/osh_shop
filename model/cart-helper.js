var extend = require('extend');
var database = require('../model/database-helper');

var cartsTableName=database.tables.carts.TABLE_NAME;

if(!database.isTableExist(cartsTableName))
    {
    database.createTable({name:cartsTableName});   
    }

var productOptionsSelect={
    cols:[database.tables.products.COL_SIZE,
          database.tables.products.COL_COLOR]
    };

var productSelect={
    cols:[database.tables.products.COL_NAME,
          database.tables.products.COL_PRICE]
    };

module.exports ={
    createCart:function(){
        var row={};
        row[database.tables.carts.COL_PRODUCTS]=[]; 

        var cartId=database.insert(cartsTableName, row);

        return cartId;
        },
    
    getCart:function(cartId){
        var cart=getCartProducts(cartId);
        var product;

        for (var i = 0; i < cart.length; i++) 
            {
            product=getProductFromDatabase(cart[i].id);
            
            if(product)
                {
                cart[i]=extend(cart[i], product);   
                }else
                    {
                    cart.splice(i, 1);
                    i--;    
                    }
            }

        return cart;
        },
    
    isCartEmpty:function(cartId){
        var cart=getCartProducts(cartId);
        return cart.length === 0;
        },
    
    addProduct:function(cartId, product){

        if(!product || !product.id)
            {
            throw new Error("the product is invalid - " + product);    
            }
        
        var cartProducts=getCartProducts(cartId);
        product.options=product.options || getDefaultProductOptions(product.id);

        var cartProduct=cartProducts.find(function(cartProduct){
            return (cartProduct.id === product.id) && isEqual(cartProduct.options, product.options);
            });

        if(!cartProduct)
            {
            product=createCartProduct(product.id, product.options);
            cartProducts.push(product); 
            }else
                {
                cartProduct.qty=(product.qty)? parseInt(product.qty) : cartProduct.qty + 1; 
                }  

        updateCart(cartId, cartProducts);
        },
    
    removeProduct:function(cartId, product){

        if(!product || !product.id)
            {
            throw new Error("Failed to add product to the cart");    
            }
        
        var cartProducts=getCartProducts(cartId);
        product.options=product.options || getDefaultProductOptions(product.id);

        var cartProductIndex=cartProducts.findIndex(function(cartProduct){
            return (cartProduct.id === product.id) && isEqual(cartProduct.options, product.options);
            });

        if(cartProductIndex >= 0)
            {
            cartProducts.splice(cartProductIndex, 1); 
            }
        
        updateCart(cartId, cartProducts);
        },
        
    getProductCount:function(cart){
        var productsCount=0;

        for(var i=0; i < cart.length ;i++)
            {
            productsCount+=cart[i].qty;
            }
        
        return productsCount;
        }
    };

function getCartProducts(cardId){
    var where={};
    where[database.tables.carts.COL_ID]=cardId; 

    var products=database.tables.carts.COL_PRODUCTS;
    var select={
        cols:[products]
        };

    var result=database.get(cartsTableName, select, where);

    return (result.length > 0)? result[0][products] : [];
    }

function updateCart(cardId, cartProducts){
    var where={};
    where[database.tables.carts.COL_ID]=cardId; 

    var updatedData={};
    updatedData[database.tables.carts.COL_PRODUCTS]=cartProducts; 

    database.update(cartsTableName, updatedData, where);
    }

function getDefaultProductOptions(id){
    var where={};
    where[database.tables.products.COL_ID]=id;
    
    var result=database.get(database.tables.products.TABLE_NAME, productOptionsSelect, where); 
    var productOptions=result[0];

    var options={};

    for (var key in productOptions) 
        {
        options[key]=productOptions[key][0];
        }
        
    return options;
    }

function createCartProduct(id, options){
    var where={};
    where[database.tables.products.COL_ID]=id;

    var isProductExist=database.isExist(database.tables.products.TABLE_NAME, where);

    if(!isProductExist)
        {
        throw new Error("product does not exist");    
        }

    return {id:id, options:options, qty:1};
    }

function isEqual(objA, objB){
   
    if(!objA || !objB)
        {
        return objA === objB;  
        }
    
    var isEqual=true;

    for(var key in objA) 
        {
        if(objA[key] !== objB[key])
            {
            isEqual=false;    
            }
        }  

    return isEqual;
    }

function getProductFromDatabase(id){
    var where={};
    where[database.tables.products.COL_ID]=id;

    var result=database.get(database.tables.products.TABLE_NAME, productSelect, where);
    
    return (result.length > 0)? result[0] : undefined;
    }

