/*jshint node:true */
'use strict';

const assert = require('assert');
const util = require('util');
const ExpressSocketIO = require('..');

//
function TestServer(port, schema, options){

}

function logResponse(res){
    console.log(util.inspect(res));
}

//
describe('ExpressSocketIO tests', function(){
    var server;

    before(function(){
        
    });

    after(function(done){
        if(server){
            server.close(done);
            server = null;
        }
    });
    
    //

});