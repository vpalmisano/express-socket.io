/*jshint node:true */
'use strict';

const debug = require('debug')('express-socket.io');
const _ = require('lodash');

module.exports = function(server, connectCallback){

    server._handlers = {};

    server.on('error', function(err){
        console.error('io error:', err);
    });

    // handlers
    server.on('connection', function(socket){
        debug('connected');

        var req = {
            user: null,
            query: null,
            socket: socket,
        }

        //
        if(connectCallback){
            connectCallback(req, null, function(err){
                if(err){
                    console.error(err);
                    socket.disconnect();
                    return;
                }
                _setupHandlers();
            });
        }
        else{
            _setupHandlers();
        }

        //
        function _setupHandlers(){
            Object.keys(server._handlers).forEach(function(path){
                trace('adding handler', path);

                var pathHandlers = server._handlers[path];

                // register handler
                socket.on(path, function(data, cb){
                    trace('on '+path, data);

                    req.query = data;
                    var res = {}
                    var i = 0;
                    
                    function applyNext(){
                        if(i >= pathHandlers.length){
                            // return results
                            cb && cb(null, res);
                            return;
                        }

                        //
                        pathHandlers[i](req, res, function(err){
                            if(err){
                                console.error('['+path+'] io error:', err);
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
            }
    });

    //
    server.register = function(path){
        debug('register', path);

        if(server._handlers[path]){
            return console.error('Error: handler already registered:', path);
        }

        var pathHandlers = Array.prototype.slice.call(arguments, 1);
        server._handlers[path] = pathHandlers;
    }.bind(server);
}