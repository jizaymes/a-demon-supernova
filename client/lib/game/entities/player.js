ig.module( 
    'game.entities.player'
)
.requires(
    'impact.entity'
)
.defines(function(){

	EntityPlayer = ig.Entity.extend({
		
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
		},
		update: function() {			
			this.parent();		
		},
})


});