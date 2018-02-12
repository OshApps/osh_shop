var fs = require('fs');
var extend = require('extend');

var databasePath="./database";
var tableFileExtenstion=".db";

Table.prototype=getTablePrototype();
defaultTableOptions={
    autoIncrement:true,
    incrementId:1000
    };

var tables=getTables(databasePath);

module.exports = {
    createTable:function(tableData){
        var tableName,tablePath;

        tableName=tableData.name ;

        if(tableName && !tables[tableName])
            { 
            tablePath=databasePath + "/" + tableName + tableFileExtenstion;
            tables[tableName]=new Table(tablePath, tableData.options);   
            }
            
        },

    insert:function(tableName, row){
        return tables[tableName].insert(row);
        },
    
    update:function(tableName, updatedData, where){
        return tables[tableName].update(updatedData ,where);
        },
    
    delete:function(tableName, where){
        return tables[tableName].delete(where);
        },
    
    get:function(tableName, select, where){
        return tables[tableName].get(select, where);
        },
    
    isExist:function(tableName, where){
        return tables[tableName].isExist(where);
        },
    
    isTableExist:function(tableName){
        return tables[tableName] !== undefined;
        }
    };

function getTables(dirPath){
    var tables={};
    var tableNames=readDir(dirPath, []);
    var tableName;

    for (var i = 0; i < tableNames.length; i++) 
        {
        tableName=tableNames[i].slice(0, tableNames[i].length - tableFileExtenstion.length);

        tables[tableName]=new Table(dirPath + "/" + tableNames[i]);
        }
    
    return tables;    
    } 


function readDir(path, defaultValue){
    var data;

    if(fs.existsSync(path))
        {
        data=fs.readdirSync(path);    
        }else
            {
            fs.mkdirSync(path);    
            data=defaultValue;    
            }

    return data;
    } 

function readFile(path, defaultValue){
    var data;

    if(fs.existsSync(path))
        {
        data=fs.readFileSync(path,"utf8");    
        }else
            {
            writeFile(path, defaultValue);      
            data=defaultValue;    
            }

    return data;
    }  

function writeFile(path, content){

    try {
        fs.writeFileSync(path, content);
        }catch(e)
            {
            console.log("Cannot write file - "+ path, e);
            } 
    } 

function Table(path,options){
    this.path=path;
    
    options=extend(true, {}, defaultTableOptions, options);

    var defaultValue={rows:[], options:options};

    var jsonData=readFile(this.path, JSON.stringify(defaultValue));
    
    var tableData=JSON.parse(jsonData);

    this.rows=tableData.rows;
    this.options=tableData.options;
    }    

function getTablePrototype(){
    var defaultSelect={
        cols:undefined,
        limit:Infinity,

        };

    return{
        constructor:Table,

        insert:function(row){

            if(this.options.autoIncrement === true)
                {
                row.id=""+getIncrementId.call(this);    
                }

            this.rows.push(row);

            updateData.call(this);

            return row.id;
            },
        
        update:function(updatedData ,where){
            var isUpdated=false;

            match(this.rows, where, function(index){

                for(var key in updatedData) 
                    {
                    this.rows[index][key]=updatedData[key];    
                    }
                
                isUpdated=true;    
                }.bind(this));
                
            if(isUpdated)
                {
                updateData.call(this);    
                }
        
            return isUpdated;
            },
        
        delete:function(where){
            var isDeleted=false;
            var rows=this.rows;
            
            for (var i = 0; i < rows.length; i++) 
                {

                if(isMatch(rows[i], where))
                    {
                    rows.splice(i, 1);
                    isDeleted=true;
                    i--;
                    }
                }

            if(isDeleted)
                {
                updateData.call(this);     
                }
        
            return isDeleted;
            },
        
        get:function(select, where){
            var rows=[];
            
            select=extend(true, {}, defaultSelect, select);

            if(select.limit <= 0)
                {
                return rows;
                }
            
            var selectedCols=select.cols;
            var row;

            match(this.rows, where, function(index){
                row=this.rows[index];

                if(selectedCols && selectedCols.length > 0)
                    {
                    row=getSelectedCols(row, selectedCols);     
                    }
                    
                rows.push(row);  

                return select.limit > rows.length;
                }.bind(this));
                    
            return rows;
            },
        
        isExist:function(where){
            var isExist=false;

            match(this.rows, where, function(index){
                isExist=true;  

                return false; 
                }.bind(this));
                    
            return isExist;
            }
        };

    function updateData(){
        var tableData={rows:this.rows, options:this.options};
        var jsonData= JSON.stringify(tableData);

        writeFile(this.path, jsonData);
        }  

    function getIncrementId(){
        var id=this.options.incrementId;

        this.options.incrementId++;

        return id;
        } 
    } 

function getSelectedCols(row, select){
    var cols={};
    var col;

    for(var i = 0; i < select.length; i++) 
        {
        col=select[i];
        cols[col]=row[col];
        }

    return cols;
    }
    
function match(rows, where, callback){

    for (var i = 0; i < rows.length; i++) 
        {

        if(isMatch(rows[i], where))
            {
            
            if(callback(i) === false)
                {
                break;   
                }
            }
        }
    }  

function isMatch(row, where){
    var isMatch=true;

    for (var key in where) 
        {
        isMatch=(typeof where[key] === 'function')? where[key](row[key]) : where[key] === row[key];

        if(!isMatch)
            {
            break;    
            }
        }

    return isMatch;
    }
