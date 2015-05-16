ig.module( 
    'game.entities.network-player'
)
.requires(
    'game.entities.player'
)
.defines(function(){

	EntityNetworkPlayer = ig.Entity.extend({
		
		_wmIgnore: true,
		
		size: { x:32, y:32 },
		
		// Does the local keyboard move the player?
		controlledByLocalKeyboard: false,
		
		collides: ig.Entity.COLLIDES.ACTIVE,
		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.NONE,
	
		params: null,
						
		defaultSpeed: 150,
		speed: 150,
		maxVel: {x: 150, y: 150},
		
		lastDirection: "down",
		escPressed: false,
		zIndex: 100,
		
		chatBubble: undefined,
		
		optionsTimer: null,
		optionsReady: false,
		
		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			
			var player = this;
			
			
			// Some player changed his movement state.
			socket.on('moveUpdateOtherPlayer-' + this.playerID, function(x, y, direction, state) {
				player.vel.x = player.vel.y = 0;
				player.pos.x = x;
				player.pos.y = y;
				player.facing = direction;				

			});
			
			ig.game.serverSocket.on('dropPlayer-' + this.playerID, function() {
				
				// Write to chat log.
			//	ig.game.chatLog.push('<div class="info">[' + ig.game.chatNameHTML(player.params.name) + '] left the area.</div>');

				// Free resources.
				player.kill();
			});			
			
			
			
		},
		update: function() {			
			this.parent();		
		},
})


});