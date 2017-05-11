const SocketIO = require('socket.io');
const ExpressSocketIO = require('..');

var io = new SocketIO(8080);
ExpressSocketIO(io);

io.register('test:path', function(req, res, next){
    console.log('request:', req.query, req.socket);
    res.send({
        query: req.query
    });
    next();
});