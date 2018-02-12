module.exports = function (grunt){
    grunt.initConfig({
        jshint:{
            client:{
                files:{src:["public/**/*.js"]}
                },
            
            server:{
                files:{src:["model/**/*.js","routes/**/*.js"]}
                }
            }
        });
    
    //active jshint
    grunt.loadNpmTasks("grunt-contrib-jshint");

    };