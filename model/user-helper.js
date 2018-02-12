var extend = require('extend');
var database = require('../model/database-helper');

var usersTableName=database.tables.users.TABLE_NAME;

if(!database.isTableExist(usersTableName))
    {
    database.createTable({name:usersTableName});   
    }

module.exports ={
    createUser:function(email,pass,name,cartId){
        var row={};
        row[database.tables.users.COL_EMAIL]=email; 
        row[database.tables.users.COL_PASS]=pass; 
        row[database.tables.users.COL_NAME]=name; 
        row[database.tables.users.COL_CART_ID]=cartId; 

        var userId=database.insert(usersTableName, row);

        return userId;
        },
    
    getUser:function(email, password){
        var where={};
        where[database.tables.users.COL_EMAIL]=email; 
        where[database.tables.users.COL_PASS]=password; 

        var result=database.get(usersTableName, null, where);

        return result[0];
        },
    
    getUserById:function(userId){
        var where={};
        where[database.tables.users.COL_ID]=userId; 

        var result=database.get(usersTableName, null, where);

        return result[0];
        },
    
    updateUserCart:function(userId, userCartId){
        var updatedData={}
        updatedData[database.tables.users.COL_CART_ID]=userCartId; 

        var where={};
        where[database.tables.users.COL_ID]=userId; 

        return database.update(usersTableName, updatedData, where);
        },
    
    isEmailExist:function(email){
        var where={};
        where[database.tables.users.COL_EMAIL]=email; 

        return database.isExist(usersTableName, where);
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

