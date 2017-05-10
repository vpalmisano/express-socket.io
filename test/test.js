/*jshint node:true */
'use strict';

const assert = require('assert');
const util = require('util');
const ExpressSocketIO = require('..');
const SocketIO = require('socket.io');
const SocketIOClient = require('socket.io-client');

//
function TestServer(port, options){
    var io = new SocketIO(port);
    ExpressSocketIO(io);

    return io;
}

function logResponse(res){
    console.log(util.inspect(res));
}

//
describe('ExpressSocketIO tests', function(){
    const PORT = 12345;
    var server;
    var client;

    before(function(){
        server = TestServer(PORT);
    });

    after(function(){
        if(server){
            server.close();
            server = null;
        }
    });
    
    beforeEach(function(){
        
    });

    afterEach(function(){
        if(client){
            client.disconnect();
            client = null;
        }
    });

    //
    it('register callbacks', function(done){
        server.register('test:1', function(req, res, next){
            next();
        }, function(req, res, next){
            next();
        });
        assert(server._handlers['test:1'].length === 2);
        done();
    });

    it('should throw an exception when registering multiple times on the same path', function(done){
        try{
            server.register('test:1', function(req, res, next){});
        }
        catch(err){
            done();
        }
    });

    it('unregister callback', function(done){
        server.unregister('test:1');
        assert(server._handlers['test:1'] === undefined);
        done();
    });

    it('should throw an exception when unregistering not registered callback', function(done){
        try{
            server.unregister('test:0');
        }
        catch(err){
            done();
        }
    });

    //
    it('should response to a client request', function(done){
        server.register('test:2', function(req, res, next){
            next();
        }, function(req, res, next){
            res.send({
                data: req.query.data,
                response: true
            });
            next();
        });

        client = SocketIOClient.connect('http://localhost:'+PORT);
        client.emit('test:2', { data: 'test' }, function(err, res){
            assert(err === null, 'response error');
            assert(res.response === true, 'wrong response');
            assert(res.data === 'test', 'wrong data');
            done();
        });
    });

    //
    it('should response only with the first registered callback send()', function(done){
        server.register('test:3', function(req, res, next){
            res.send({
                data: req.query.data,
                response: 1
            });
            next();
        }, function(req, res, next){
            res.send({
                response: 2
            });
            next();
        });

        client = SocketIOClient.connect('http://localhost:'+PORT);
        client.emit('test:3', { data: 'test' }, function(err, res){
            assert(err === null, 'response error');
            assert(res.response === 1, 'wrong response');
            assert(res.data === 'test', 'wrong data');
            done();
        });
    });

    //
    it('should send a response error when using next(error)', function(done){
        server.register('test:4', function(req, res, next){
            next(new Error('error!'));
        }, function(req, res, next){
            res.send({
                response: 2
            });
            next();
        });

        client = SocketIOClient.connect('http://localhost:'+PORT);
        client.emit('test:4', { data: 'test' }, function(err, res){
            assert(err === 'error!', 'response error');
            done();
        });
    });

});