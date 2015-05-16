var app_path = "/var/www/a-demon-supernova";

var http        = require('http'),
    https       = require('https'),
    fs          = require('fs'),
    querystring = require('querystring'),
    crypto      = require('crypto'),
    path 	= require('path');    

// For information on how to get these files see: https://tootallnate.net/setting-up-free-ssl-on-your-node-server
// If you don't want https you can comment out the following 7 lines.
var httpsOptions = {
//  'ca':   fs.readFileSync('../ssl/geotrust.pem'),
  'key':  fs.readFileSync(app_path + '/ssl.key'),
  'cert': fs.readFileSync(app_path + '/ssl.crt')
};

var server = https.createServer(httpsOptions, handleRequest);
server.listen(443);

var playerDefaults = Object();

playerDefaults = {
	name: "Player"+Math.floor((Math.random()*3)+1),
	curHP: 10,
	maxHP: 10,
	curMP: 0,
	maxMP: 0,
	gold: 5,
	xp: 0,
	level:1,
	map: "LevelWorldMap",
	lastX: 0,
	lastY: 0,
	class: 'Hotshot'
};
   
    
var io = require('socket.io').listen(server);


// Simple function to decode a base64url encoded string.
function base64_url_decode(data) {
  return new Buffer(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('ascii');
}


// Wait for and parse POST data
function parse_post(req, callback) {
  // Pushing things into an array and joining them in the end is faster then concatenating strings.
  var data = [];

  req.addListener('data', function(chunk) {
    data.push(chunk);
  });

  req.addListener('end', function() {
    callback(querystring.parse(data.join('')));
  });
}



// Uncomment this to catch all exceptions so the server doesn't crash.
process.on('uncaughtException', function (err) {
  console.log(err.stack);
});



// Make sure we are in the correct working directory, otherwise fs.readFile('header.html' will fail.
if (process.cwd() != __dirname) {
  process.chdir(__dirname);
}



var contentTypes = {
  'js':  'text/javascript',
  'css': 'text/css',
  'png': 'image/png',
  'html': 'text/html',
  'jpg' : 'image/jpeg',
  'ttf' : 'application/octet-stream'
};

// Set up mySQL connection.

var mysql = require('mysql');

var login = require('./mysql-connection');

var connection = mysql.createConnection({
  host     : login.hostname(),
  user     : login.username(),
  password : login.password(),
  database : login.database(),
  insecureAuth: true
});

connection.connect(function(err) {

  if(err) console.log('mysql connection problem - error code: ' + err.code + ' fatal: ' + err.fatal);
    console.log("Connected to MySQL");
});

connection.on('error', function(err) {
    if(err) {
        console.log(err.code);
        //throw err;
    }
});

connection.on('close', function(err) {
    if (err) {
        console.log(getTime() + " MYSQL CONNECTION CLOSED UNEXPECTEDLY. RECONNECTING...");
        connection = mysql.createConnection(connection.config);
    }
});

var onlinePlayers = new Array();

// Most users seen online since server started.
var mostOnline = 0;
io.set('log level', 2);

// Report how many players online.
var playersReport = function() {
    console.log(getTime() + " PLAYERS ONLINE: " + onlinePlayers.length + " MOST ONLINE: " + mostOnline);
}

// Records the most users seen online.
function recordMostOnline() {

    if(onlinePlayers.length > mostOnline) mostOnline = onlinePlayers.length;
}

// Boots user with undefined name.
function bootUnauthorized(socket) {

    if(typeof socket.playerID === 'undefined') {

        socket.emit('error', 'You are not authenticated to the server. The server may have rebooted.');
	console.log('not authorized');
        socket.disconnect();
        return true;
    }

    return false;
}

// Get the time as a string.
function getTime() {

    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var amOrPm = (hours > 11 ? 'PM':'AM');
    
    if( hours===0 )     hours = 12;
    else if( hours>12 ) hours = hours - 12;

    minutes = ( minutes < 10 ? '0' + minutes : minutes );

    return hours + ':' + minutes + amOrPm;
}



function preparePlayer(playerRow,socketID) {
				
		// Found user.
		var playerID   = playerRow.playerID;
		
		var params = eval('(' + playerRow.params + ')');
				
		console.log('Preparing for player : ' + params.name);				
				
		var player = { 
			playerID: playerID,
			params: params,
			sessionID: socketID
		};
			
		initializePlayer( player );
}


function initializePlayer( player ) {
    console.log(getTime() + " ADDING PLAYER " + player.params.name + ' [' + player.sessionID + ']' );
   
    if(!player.params.map) {
    	player.params.map = "LevelWorldMap";
    }
        
    onlinePlayers.push(player);
    
//    sendAnnouncement(player,player.params.name + ' has joined the game' );
    
//    io.sockets.sockets[player.sessionID].roomname = player.params.map;

//    joinChatRoom(player); 

//    introducePlayerToRoom(player);

    loadMap(player);

    // Update most seen.
//    recordMostOnline();

    // List online players.
//    playersReport();

}

// Send a message from the server.
function sendPlayerDetails(player) {

            var sessionID = player.sessionID;
            console.log(player.params.name);
            
            io.sockets.sockets[sessionID].emit('loadPlayerDetails', player);
            return;
}


// Send a message from the server.
function sendAnnouncement(player, message) {

            var sessionID = player.sessionID;
            
            io.sockets.sockets[sessionID].emit('announcement', message);
            return;
}



// Joins a user to a chat room.
function joinChatRoom(player) {

            var sessionID = player.sessionID;
            var room = player.params.map;

            io.sockets.sockets[sessionID].join(room);
            console.log(getTime() + ' ' + player.params.name + '[' + player.playerID + '] ENTERED ' + room);
}

// Tell users in a room to add a new player.
function introducePlayerToRoom(player) {

            var sessionID = player.sessionID;

            io.sockets.sockets[sessionID].broadcast.to(player.params.map).emit('addPlayer', player);
}

// Instruct client to load a map.
function loadMap(player) {

    io.sockets.sockets[player.sessionID].emit('loadMap', player.params);
}

// Removes HTML characters from messages that could allow players to phish.
function deHTML(message) { return message.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;"); }

// Dump the contents of an object.
function dump(obj) {
    var out = '';
    for (var i in obj) {
        out += i + ": " + obj[i] + "\n";
    }

    console.log(out);
}

function sendHeartbeat(){
	
    if(onlinePlayers.length > 0) {
	io.sockets.emit('ping', { beat : 5 });
	console.log(getTime() + " Pinging all sockets.");
    }
}







setInterval(sendHeartbeat, 32000);

io.sockets.on('connection', function(socket) {

    socket.on('pong', function(data){
        console.log(getTime() + " Pong received from " + socket.playerID);
    });

    socket.on('ping', function(data){
        console.log(getTime() + " Ping received from " + socket.playerID);
        socket.emit('pingresponse','');
    });

    socket.on('init', function(playerID,name) {
    
    	if (playerID === 'undefined')
    	{
    		 console.log('returning'); return;
    	}
    
		console.log(playerID + ' has connected');
		var playerRow;
		
		socket.playerID = playerID

        // Check that user not already online.
        for (var i = 0; i < onlinePlayers.length; i++) {
           
            if (onlinePlayers[i].playerID === socket.playerID) {
                
                console.log(getTime() + ' ' + "DROPPING " + socket.playerID + " FOR USING ALREADY IN-USE NAME.");
                socket.emit('error', 'The username ' + socket.playerID + ' is already in use. Please use another.');
                socket.disconnect();
                return;
            }
        }

	var playerRow;
	
        connection.query("SELECT playerID, params FROM players WHERE playerID = '" + socket.playerID + "'", function(err, rows) {
            
		if (err) {

		        console.log(err.code);
		        console.log(err.fatal);
            
	        } else {

	                if(rows.length==0) {
				console.log('No user -- adding');
				socket.emit('error', 'No such user in database.');
			
				var newPlayer = playerDefaults;
	             		newPlayer.name = name;
             	 	
	             	 	var sqlStatement = "INSERT INTO players(playerID, params) VALUES(" + socket.playerID + ",\'"+ JSON.stringify(newPlayer, null) + "\')";
             	 	
	             	 	console.log(sqlStatement);
		              	connection.query(sqlStatement, function(err, myrows) {
	              			if(err) {
						console.log(err.code);
						console.log(err.fatal);
	              				socket.emit('error','Could not add to database');
	              				socket.disconnect();
				                return;
	              			} else {
              			           				
						connection.query("SELECT playerID, params FROM players WHERE playerID = " + socket.playerID, function(err, rows) {
				                	console.log("Added new SQL Row");
	              					preparePlayer(rows[0],socket.id);
		      				});  // check after the insert was done
	              			} // if err
	              		}); // insert
			} else {
				preparePlayer(rows[0],socket.id);
				
				
			}
                } // found row or add row
	}); // First connection was successful

    }); //socket

    socket.on('getNearbyPlayers', function() {

//        if(bootUnauthorized(socket)) return;

		console.log('getNearbyPlayers');
		
		var map; 
		
        for (var i = 0; i < onlinePlayers.length; i++ ) {
            console.log(onlinePlayers[i]);
            if (onlinePlayers[i].sessionID === socket.id) {
        		map = onlinePlayers[i].params.map;    		
            }
        }
        
        nearbyPlayers = new Array();
	console.log('got to the next for loop, map = ' + map);
        for (var i = 0; i < onlinePlayers.length; i++ ) {
            
            if (onlinePlayers[i].params.map === map) {
                			
                nearbyPlayers.push(onlinePlayers[i]);
            }
        }
	console.log('This many nearby players, inclusive : ' + nearbyPlayers.length);
        if( nearbyPlayers.length > 0 ) socket.emit('addNearbyPlayers', nearbyPlayers);
    });

    socket.on('playerPortal', function(playerID,map,gameState,x,y) {

        if(bootUnauthorized(socket)) return;
	
	console.log('received playerPortal  ');
	console.log('             Player ID : ' + playerID );
	console.log('                   Map : ' + map );
	console.log('             gameState : ' + gameState );
	console.log('                 x / y : ' + x + ' / ' + y );

        for (var i = 0; i < onlinePlayers.length; i++ ) {
            
            if (onlinePlayers[i].sessionID == socket.id) {
                
		console.log('relocating player ' + socket.playerID);
		
		onlinePlayers[i].params.lastX = x;	
		onlinePlayers[i].params.lastY = y;
		onlinePlayers[i].params.map = map;
		
		var player = onlinePlayers[i];
		
/*		sendPlayerDetails(player);
		
		sendAnnouncement(player,player.params.name + ' has joined the region' );
    
		io.sockets.sockets[player.sessionID].roomname = player.params.map;

		joinChatRoom(player); 

		introducePlayerToRoom(player);*/

		loadMap(player);

                return;
            }
        }     	
	

    });
    
    socket.on('playerStart', function() {

        if(bootUnauthorized(socket)) return;

	console.log('received playerStart');

        for (var i = 0; i < onlinePlayers.length; i++ ) {
            console.log(onlinePlayers[i]);
            if (onlinePlayers[i].sessionID == socket.id) {
                
		console.log('emitting playerStart' + socket.playerID);
		console.log(onlinePlayers[i]);
                socket.emit('playerStart-' + socket.playerID, onlinePlayers[i]);

                return;
            }
        }        
    });


    socket.on('playerLeaveZone', function() {

        if(bootUnauthorized(socket)) return;

        // instruct others to drop this player
        socket.broadcast.to(socket.roomname).emit('dropPlayer-' + socket.playerID);
        socket.leave(socket.roomname);
        // stop listening
        socket.roomname = 'limbo';
        socket.join(socket.roomname);
    });


    socket.on('receiveUpdateMoveState', function(x, y, direction, state) {

        if(bootUnauthorized(socket)) return;

        socket.broadcast.to(socket.roomname).emit('moveUpdateOtherPlayer-' + socket.playerID, x, y, direction, state);

        // update players known ivalinfo on server
        for (var i = 0; i < onlinePlayers.length; i++) {
            if (onlinePlayers[i].params.name == socket.playerID) {
                onlinePlayers[i].params.lastX = x;
                onlinePlayers[i].params.lastY = y;
                onlinePlayers[i].facing = direction;
                onlinePlayers[i].gameState = state;
                break;
            }
        }
    });

    socket.on('receiveUpdatedParams', function(params) {

        if(bootUnauthorized(socket)) return;

        //socket.broadcast.to(socket.roomname).emit('moveUpdateOtherPlayer-' + socket.playerID, x, y, direction, state);
	var origName;
	
        // update players known valinfo on server
        for (var i = 0; i < onlinePlayers.length; i++) {
            if (onlinePlayers[i].params.name == socket.playerID) {
		origName = onlinePlayers[i].params.name;
                onlinePlayers[i].params = params;
                onlinePlayers[i].params.name = origName;
		
                break;
            }
        }
    });

    
/*
    socket.on('receiveSay', function(msg) {
        
        if(bootUnauthorized(socket)) return;

        // Checks that message contains non-whitespace.
        if (msg.trim().length > 0) {
            
            socket.broadcast.to(socket.roomname).emit('newMsg', socket.clientname, deHTML(msg));
            console.log(getTime() + ' ' + "[" + socket.roomname + "][" + socket.clientname + "] " + msg);
        }
    });

    socket.on('receiveTell', function(to, msg) {

        if(bootUnauthorized(socket)) return;
        
        // Checks that message contains non-whitespace.
        if (msg.trim().length > 0) {

            // Find recipient.
            for (var i = 0; i < onlinePlayers.length; i++) {
                
                if (onlinePlayers[i].name.toLowerCase() == to.toLowerCase()) {
                    
                    io.sockets.socket(onlinePlayers[i].session).emit('incomingTell', socket.clientname, deHTML(msg));
                    
                    console.log(getTime() + " [" + socket.clientname + "][" + to + "] " + msg);
                    
                    return;
                }
            }

            socket.emit('logError', "Player not found.");
        }
    });
*/

    socket.on('disconnect', function() {

        if(typeof socket.playerID === 'undefined') return;

        console.log(getTime() + ' ' + socket.playerID + " DISCONNECTED");

		var map;
		
        // remove client from onlinePlayers array
        for (var i = 0; i < onlinePlayers.length; i++) {
            
            if (onlinePlayers[i].playerID === socket.playerID) {
        		map = onlinePlayers[i].params.map;        
            	console.log('matched one disconnect' + map);
                onlinePlayers.splice(i, 1);
            }
        }
		console.log('about to drop player' + socket.playerID);
        socket.broadcast.to(map).emit('dropPlayer-' + socket.playerID, socket.playerID);

  //      playersReport();

    });


});


/*
function handler(req, res) {
    fs.readFile( + '/index.html', function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
}
*/

    
function handleRequest(req, res) {

  // Serve .js and .css files (files must be in a subdirectory so users can't access the javascript files for nodejs).
    var filePath = req.url;

//	console.log(filePath);
//	var validFile = new RegExp('^\/[a-zA-Z]\/[0-9a-zA-Z\-]*\.(js|css|html|jpg|png|htm)$');
//	var validFile = new RegExp('^\/[A-Za-z0-9\.\/\?\-\_]*\.(js|css|html|jpg|png|htm)$');
	var validFile = new RegExp('.*\.(js|css|html|jpg|png|htm|ttf)$');

	

	
//	console.log(validFile.test('/client/lib/game/entities/zone-banner.js'));
	
  // Serve .js and .css files (files must be in a subdirectory so users can't access the javascript files for nodejs).
  //console.log('Serving File: ' + req.url);
 
  if (validFile.test(req.url) ) {
    // substr(1) to strip the leading /
    fs.readFile(req.url.substr(1), function(err, data) {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('File not found.' + data);
      } else {
        var ext = req.url.substr(req.url.lastIndexOf('.') + 1);
          
        res.writeHead(200, {'Content-Type': contentTypes[ext]});
        res.end(data);
      }
    });

    return;
  }

/*
//	filePath = "client/innerIndex.html";

	var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.ico':
            contentType = 'image/icon';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.png':
            contentType = 'image/png';
            break;

    }

    if(req.url.substr(2) != "/?") { 
	path.exists(filePath, function(exists) {
		console.log('checking file existence...');
		if(exists) {	
			console.log('it exists');
		    fs.readFile(filePath, function(error, content) {
	                if (error) {
	                    res.writeHead(500);
	                   	console.log('erroring');
	                    res.end();
           		       return false;	                    
	                }
	                else {
	                	console.log('ending');
	                    res.writeHead(200, { 'Content-Type': contentType });
	                    res.end(content, 'utf-8');
           		       return true;
	                }
	       

	    	});
	    } else {
			res.writeHead(404);
			console.log('file not found');
			res.end();
			return false;	                    
	    }
	});
	}
*/

	
  // Facebook always opens the canvas with a POST
/*  if (req.method != 'POST') {
    res.end('Error: No POST -- being accessed outside of facebook');
    return;
  }

  // Get the POST data.
  parse_post(req, function(data) {
    if (!data.signed_request) {
      res.end('Error: No signed_request');
      return;
    }
    
    // The data Facebook POSTs to use consists of one variable named signed_request that contains 2 strings concatinated using a .
    data = data.signed_request.split('.', 2);

    var facebook = JSON.parse(base64_url_decode(data[1])); // The second string is a base64url encoded json object

    if (!facebook.algorithm || (facebook.algorithm.toUpperCase() != 'HMAC-SHA256')) {
      res.end('Error: Unknown algorithm');
      return;
    }

    // Make sure the data posted is valid and comes from facebook.
    var signature = crypto.createHmac('sha256', '49870b7d05eea4371661f0d4b722633f').update(data[1]).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace('=', '');

    if (data[0] != signature) {
      res.end('Error: Bad signature');
      return;
    } */

    // Has the user authenticated our application?
/*    if (!facebook.user_id) {
      res.writeHead(200, {'Content-Type': 'text/html'});

      // Redirect the user to a page where he/sh can authenticated our application.
      // For this example we only request user_about_me permission.
      // See http://developers.facebook.com/docs/reference/api/permissions/ for other types of permissions.
      var url = 'http://www.facebook.com/dialog/oauth?client_id=167423636625119&redirect_uri=http://apps.facebook.com/a-demon-supernova/&scope=user_about_me';

      res.end('<!DOCTYPE html><html><head><meta charset=utf-8><script>top.location.href="'+url+'";</script></head><body>You are being redirected to <a href="'+url+'" target="_top">'+url+'</a></body></html>');
    } else { */




      res.writeHead(200, {'Content-Type': 'text/html'});

      fs.readFile('client/header.html', function(err, data) {
        res.write(data);

        // We are going to write the facebook token for this user to the page so it can be passed to our lobby server.
        // Since it is possible to run our lobby server on a different node instance we can't just store it in a global variable here.
        // We don't want others to be able to see and use the token so we crypt it
        //var tokencrypt = crypto.createCipher('des-ecb', 'xcz834ndgjzxc4rjgjsjsdf');

        // base64 encoding should be smaller but old nodejs versions bug with this (see https://github.com/joyent/node/commit/e357acc55b8126e1b8b78edcf4ac09dfa3217146)
/*        var token = tokencrypt.update(facebook.oauth_token, 'ascii', 'hex')+tokencrypt.final('hex');


		console.log(facebook);
        res.write('<script>var nfe = {facebookid: '+facebook.user_id+', facebooktoken : "'+facebook.oauth_token+'", facebookname : "'+facebook.name+'"};</script>');*/

        fs.readFile('client/body.html', function(err, data) {
          res.end(data);
        });
      });
   //} 
  //});
 }





// In this example we run the lobby server on the same node instance using the same port.
// In theory we could also run this on a seperate node instance.
//var lobby = require('./lobby');

//lobby.start(httpServer);
//lobby.start(httpsServer);


// Never let something run as root when it's not needed!
if (process.getuid() == 0) {
  process.setgid('www-data');
  process.setuid('www-data');
}

