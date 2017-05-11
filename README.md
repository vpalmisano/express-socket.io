# express-socket.io-router

Express-like routing interface for Socket.IO

[![Build Status](https://travis-ci.org/vpalmisano/express-socket.io-router.png)](https://travis-ci.org/vpalmisano/express-socket.io-router)

## Install

```sh
npm install --save express-socket.io-router
```

## Usage

### Server

```javascript
const SocketIO = require('socket.io');
const ExpressSocketIO = require('express-socket.io-router');

io.register('test:path', function(req, res, next){
    console.log('request:', req.query, req.socket);
    res.send({
        query: req.query
    });
    next();
});
```

### Client

```javascript
const SocketIOClient = require('socket.io-client');

client = SocketIOClient.connect('http://localhost:8080');
client.emit('test:path', { data: 'test' }, function(err, res){
    console.log('response:', res);
});
```
