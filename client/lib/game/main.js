ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	
//    'impact.debug.debug',

	'game.chat-log',
	
	'game.entities.player',
	'game.entities.local-player',
	'game.entities.network-player',
	
	'game.entities.npc',
	
	'game.entities.settings',	
	'game.entities.zone-banner',	
	'game.entities.zone',	
	'game.entities.hud',    
	'game.entities.chat-bubble',
      
	'game.levels.world-map',
	'game.levels.dokkenshire',	
	
	'plugins.pause-focus',
	'plugins.perpixel'
)
.defines(function(){"use strict"

var aDemonSupernova = ig.Game.extend({
        autoSort: true,
        sortBy: ig.Game.SORT.POS_Y,
	
	gameState: { 
		currentState: 0,
        	lastState: null,
	    	INIT: 0,
        	LOADING: 1,
        	MAINMENU: 2,
        	WORLDMAP: 3,
        	OPTIONSMENU: 4,
        	CITY: 5,
        	CHAT: 6,
        	BUILDING: 7
        },
        server: {
	    prefix: "https",
	    host: "app02.gozunga.com",
	    port: "443",
	},
	serverSocket: null,

	playerID: 707476257,
	mapLoaded: false,
	facebook: null,
	lastEntities: [ ],

	player: null,
	
	init: function() {
		this.initKeysMouseAndScreen();
	//	this.setupFacebook();	
	    
		this.setupServer();
                ig.game.serverSocket.emit('init', ig.game.playerID,'Hotshot');
		
	},
	update: function() {

			this.parent();
	},
	draw: function() {
		
		this.parent();
		if( this.mapLoaded === true ) {
		
		    for ( var x = 0; x < this.lastEntities.length; x++) {
			//console.log('looping');
		        eval(this.lastEntities[x]).draw(true);
		    }
		    
			// Draw zone banner if it should be..		
			if( this.zoneBannerEntity != null ) {
			    
			    if( typeof this.zoneBannerEntity.message !== 'undefined' && this.zoneBannerEntity.message.length > 0 ) {
			        this.zoneBannerEntity.draw( this.zoneBannerEntity.message );				
			    } else {
			        this.zoneBannerEntity.draw( ig.game.getEntitiesByType( EntitySettings )[0].name );
			    }
			}
		}	
	},
	loadLevel: function( data ) {
	console.log("In Load Level");
			
			    this.parent( data );
			    this.mapLoaded = true;
      			    //console.log('settings up player');
			   console.log(this._params);
			    this.setupPlayer(this._params);
			    this._params = undefined;				
	},
	changeLevel: function(level, overrideLocation) {	
	    this.mapLoaded = false;
		
	    var zoneBanner = this.getEntitiesByType( EntityZoneBanner )[0];
		
	    if (zoneBanner)
	    	zoneBanner.kill();

	    if(overrideLocation.x > 0)
		this._params.lastX = overrideLocation.x;

	    if(overrideLocation.y > 0)
		this._params.lastY = overrideLocation.y;
		
	    this.setState( ig.game.gameState.LOADING );
	
	    this.loadLevel( level );
	},
	getState: function() {
		return this.gameState.currentState;
	},
	setLastState: function(state) {
	
		if( state ) {
    		this.gameState.lastState = state;    			
		} else
		{
    		this.gameState.lastState = this.gameState.currentState;    	
    	}
    	
//		console.log("LastState Change: " + this.gameState.lastState);    	
	},
	initKeysMouseAndScreen: function () {

		// Create the chat log.
		//this.chatLog = new ChatLog(540, 80, 'log');
		
		ig.input.initMouse();
		
		ig.input.bind( ig.KEY.UP_ARROW, 'up' );
		ig.input.bind( ig.KEY.W, 'up' );		
		
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
		ig.input.bind( ig.KEY.S, 'down' );
		
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.A, 'left' );
		
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.D, 'right' );
		
		ig.input.bind( ig.KEY.ENTER, 'optionsmenu' );
		ig.input.bind( ig.KEY.SPACE, 'actionbutton' );
		ig.input.bind( ig.KEY.Z, 'actionbutton' );
		
		ig.input.bind( ig.KEY.T,'speak' );
		
		// Kill tab
		ig.input.bind( ig.KEY.TAB, 'tab' );
		
		ig.input.bind( ig.KEY.MOUSE1, 'mouseclick' );
		ig.input.bind( ig.KEY.MOUSE2, 'actionbutton' );
		
		ig.input.bind( ig.KEY.ESC, 'escape' );
		
		$("#canvas").attr("tabindex", "0");

		// Tell the input field how to handle 'enter' keypress.
		$('#input').bind('keypress', function(e) {
		    
			// Read key code.
			var code = (e.keyCode ? e.keyCode : e.which);
    				
                	// Check for the 'enter' key.
	    		if (code == 13) {
				    
				// Submit input.
				ig.game.chatInputOff();
					
				// Set focus back to canvas.
				$('#canvas').focus();
			}
		});
	},
	getLastState: function() {
   		return this.gameState.lastState;
	},
	setState: function(newState) {
	
	   if( newState != this.gameState.currentState ) {
			this.gameState.lastState = this.gameState.currentState;

			this.gameState.currentState = newState;

			console.log("State Change: " + newState);
		} else { 
			//console.log("Already at this state : " + newState);		
		}
	},
	setupServer: function() {
                var serverPath = this.server.prefix + '://' + this.server.host + ":" + this.server.port;
                console.log(serverPath);
    	  	this.serverSocket = io.connect(serverPath);
                
                this.serverSocket.emit('ping');
		// Load level server says to.
		this.serverSocket.on('loadMap', function(params) {
			ig.game._params = params;			

			ig.game.changeLevel( eval(params.map), { x:params.lastX,y:params.lastY });
		});

		this.serverSocket.on('announcement', function(message) {
			//ig.game.chatLog.push('<div class="announce">' + message + '</div>');
		});
		
		// Server issued error
		this.serverSocket.on('error', function(message) {
			console.log(message);
		});
		
		// Keep the connection alive when user is idle.
		this.serverSocket.on('ping', function(data){
			console.log('received ping' + data);
			
		  	ig.game.serverSocket.emit('pong', {beat: 5});
			
		});

                this.serverSocket.on('pingresponse', function(data){
			console.log('received pingresponse ' + data);
			
		});

                
	},
	setupPlayer: function(params) {
	    //console.log(params);
	    this.player = ig.game.spawnEntity( EntityLocalPlayer, params.lastX,params.lastY,{ params: params} );
	    
	    this.player.setupPlayer();
	    
	},
	setupFacebook: function() {
	    var fbUrl = "https://graph.facebook.com/" + parent.nfe.facebookid + "?access_token=" + parent.nfe.facebooktoken;
	    	    
	    this.httpRequest(fbUrl,"GET", this.fbCallback);
	},
	fbCallback: function( responseText ) {
		ig.game.facebook = JSON.parse(responseText);
		
		ig.game.serverSocket.emit('init', ig.game.facebook.id,ig.game.facebook.username);
		ig.game.playerID = ig.game.facebook.id;			
	},
	httpRequest: function(url, method, callback ) {
       		var xmlhttp;
		
		if (window.XMLHttpRequest)
		{// code for IE7+, Firefox, Chrome, Opera, Safari
		     xmlhttp = new XMLHttpRequest();
		}
		 else
		{// code for IE6, IE5
		     xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange=function()
		{
		    if (xmlhttp.readyState==4 && xmlhttp.status==200)
		    {
			    callback( xmlhttp.responseText );
		    }
		}
		
		
		xmlhttp.open(method,url,true);
		xmlhttp.send();
		
	},
	chatNameHTML: function(name) {

			// Clickable name.
			return '<a onclick="alert(\'' + name + '\');">' + name + '</a>';
	},
	chatInputOff: function() {
	
			// Get any content from the input element.
			var inputVal = $('#input').val();

//			console.log(inputVal);

			// Check if user has typed something.
			if (inputVal != '') {

				// Check first character to see if input is command.
				if (inputVal.substr(0, 1) == '/') {

					// Break the input string by spaces.
					var explodeInput = inputVal.split(' ');

					// Check for commands: /tell or /t
					if (explodeInput[0] == '/tell' || explodeInput[0] == '/t') {

						// Get recipient of message.
						var to = explodeInput[1];

						// Will store message in this variable.
						var msg = '';

						// Reconstruct message.
						for (i = 2; i < explodeInput.length; i++) {

							// Prepend space if not the first word.
							var spaceOrNot = (i == 2) ? '' : ' ';

							// Add next word.
							msg += spaceOrNot + explodeInput[i];
						}

						// Send message to server.
//						this.chatSendTell(to, msg);
					}
					// Check for commands: /say or /s
					else if (explodeInput[0] == '/say' || explodeInput[0] == '/s') {

						// Check if command is: /say 
						if (inputVal.substr(0, 4) == '/say') {
							// Strip command and first space from input.
							inputVal = inputVal.substr(5, inputVal.length - 5);
						}
						// Check if command is: /s
						else if (inputVal.substr(0, 2) == '/s') {
							// Strip command and first space from input.
							inputVal = inputVal.substr(3, inputVal.length - 3);
						}

						this.speak(inputVal);
						// Send message to ]server.
//						this.chatSendSay(player.name, inputVal);

					}
					// Invalid command.
					else {
						console.log('chat log : ' + explodeInput[0] + "'");
						//ig.game.chatLog.push('<div class="error">' + explodeInput[0] + ' is not a valid command.</div>');

					} 
				}
				// Assume it's a /say
				else {
					// Send message to server.
					ig.game.getEntitiesByType( EntityLocalPlayer )[0].speak(inputVal);
				}


			}

			// Blank the input field.
			$('#input').val('');

			// Hide the input field.
			$('#input').hide();

/*		ig.game.getEntitiesByType( EntityPlayer )[0].optionsReady = false;	
		ig.game.getEntitiesByType( EntityPlayer )[0].optionsTimer.unpause();*/
		ig.game.setState( ig.game.getLastState() );
				
	},
	getXpToLevel: function( xpAmount ){
		xpAmount += 5;
		return xpAmount;
	
	}
});

	if(ig.ua.mobile) {
		ig.main( '#canvas', aDemonSupernova, 60, 384, 240, 2 );	
	} else {
		ig.main( '#canvas', aDemonSupernova, 60, 768, 480, 1 );	
	} 

	ig.system.resize(window.innerWidth,window.innerHeight);
});
