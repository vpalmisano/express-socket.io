const SocketIOClient = require('socket.io-client');

client = SocketIOClient.connect('http://localhost:8080');
client.emit('test:path', { data: 'test' }, function(err, res){
    console.log('response:', res);
});