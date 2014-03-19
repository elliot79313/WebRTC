


var  url = require('url')
   , http = require('http')
   , path = require('path')
   , io = require('socket.io')
   , fs = require('fs')

var express=require('express');
var app = express()
  , server = http.createServer(app)
  , io = io.listen(server)
;

app.configure(function () {
    app.use( express.cookieParser() );
    app.use( express.session({secret: 'secret', key: 'express.sid'}) );
    app.use( app.router )
    app.use(express.static(path.join(__dirname, 'public')));
});


function handler (req, res) {
	
    fs.readFile(__dirname + '/index.html',
    function (err, data) {
        if (err) {
            res.writeHead(500);
			return res.end('Error loading index.html');
	    }   
        res.writeHead(200);
        res.end(data);
    }); 
}
// usernames which are currently connected to the chat
var usernames = {};

app.get('/', function (req, res) {
    res.sendfile('public/index.html');
});

io.sockets.on('connection', function (socket) {

            // when the client emits 'sendchat', this listens and executes
            socket.on('sendchat', function (data) {
            	// we tell the client to execute 'updatechat' with 2 parameters
            	io.sockets.emit('updatechat', socket.username, data);
            });
			
			
			socket.on('sendslide', function (data) {
            	// we tell the client to execute 'updateslide' with 1 parameter
            	io.sockets.emit('updateslide',  data);
            });
			
			socket.on('sendrtc', function (data) {
            	// we tell the client to execute 'updateslide' with 1 parameter
            	io.sockets.emit('updatertc',  data);
            });

			// when the client emits 'adduser', this listens and executes
			socket.on('adduser', function(username){
                // we store the username in the socket session for this client
				socket.username = username;
				// add the client's username to the global list
				usernames[username] = username;
				// echo to client they've connected
				socket.emit('updatechat', 'SERVER', 'you have connected');
				// echo globally (all clients) that a person has connected
				socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
				// update the list of users in chat, client-side
				io.sockets.emit('updateusers', usernames);
			});

            // when the user disconnects.. perform this
			socket.on('disconnect', function(){
			// remove the username from global usernames list
			delete usernames[socket.username];
			// update list of users in chat, client-side
			io.sockets.emit('updateusers', usernames);
			// echo globally that this client has left
			socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});

server.listen(8080, function() {
   //console.log("Server listening on port 8080.");
});