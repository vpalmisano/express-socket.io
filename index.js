/*jshint node:true */
'use strict';

const debug = require('debug')('express-socket.io-router');
const _ = require('lodash');

module.exports = function(server, connectCallback){

    server._handlers = {};

    server.on('error', function(err){
        console.error('io error:', err);
    });

    // handlers
    server.on('connection', function(socket){
        debug('connected');

        //
        socket.use(function(packet){
            const path = packet[0];
            const handlers = server._handlers[path];
            var data = packet[1];
            var cb = packet[2];
            
            if(!handlers){
                console.warn('unknown message', path, data);
                cb && cb();
                return;
            }
            
            //
            debug(path, data);
            
            var req = _.extend({
                query: data,
                socket: socket,
            }, socket.req || {});
            
            //
            function send(data){
                if(cb){
                    cb(null, data);
                    cb = null;
                }
                else{
                    console.error('['+path+'] response send() already called');
                }
            }

            var res = {
                set: function(key, value){

                },
                send: send,
                json: send,
            }
            
            var i = 0;
            
            function applyNext(){
                if(i >= handlers.length){
                    // call cb if not already called
                    debug('['+path+'] handlers returned');
                    cb && cb();
                    return;
                }
                
                //
                handlers[i](req, res, function(err){
                    if(err){
                        console.error('['+path+'] cb returned error:', err.message);
                        cb && cb(err.message);
                        return;
                    }
                    else{
                        i += 1;
                        applyNext();
                    }
                });
            }

            applyNext();
        });
        
    });

    server.register = function(path, handlers){
        debug('register', path);

        if(server._handlers[path]){
            throw new Error('handler already registered: '+path);
        }

        server._handlers[path] = handlers;
    }

    server.unregister = function(path){
        debug('unregister', path);

        if(!server._handlers[path]){
            throw new Error('handler not registered: '+path);
        }

        delete(server._handlers[path]);
    }

    //
    server.get = function(path, handlers){
        server.register('get:'+path, handlers);
    }
    
    server.post = function(path, handlers){
        server.register('post:'+path, handlers);
    }

    server.patch = function(path, handlers){
        server.register('patch:'+path, handlers);
    }

    server.delete = function(path, handlers){
        server.register('delete:'+path, handlers);
    }

}