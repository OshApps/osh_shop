
var tables={
    products:{
        "TABLE_NAME":"products",
        "COL_ID":"id",
        "COL_NAME":"name",
        "COL_PRICE":"price",
        "COL_DESCRIPTION":"description",
        "COL_SIZE":"size",
        "COL_COLOR":"color",
        "COL_IMG":"img",
        "COL_CATID":"catId"
        },
    
    categories:{
        "TABLE_NAME":"categories",
        "COL_ID":"id",
        "COL_CAT":"cat",
        "COL_SUBCAT":"subCat"
        },
    
    users:{
        "TABLE_NAME":"users",
        "COL_ID":"id",
        "COL_EMAIL":"email",
        "COL_PASS":"pass",
        "COL_NAME":"name",
        "COL_CART_ID":"cartId"
        },
    
    carts:{
        "TABLE_NAME":"carts",
        "COL_ID":"id",
        "COL_PRODUCTS":"products", // [{productID,options,qty}]
        }
    };

var database = require('./database');
database.tables=tables;

module.exports = database;