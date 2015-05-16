ig.module( 
    'game.entities.npc' 
)
.requires(
    'impact.entity'
)
.defines(function(){

	EntityNpc = ig.Entity.extend({
		
		size: { x:32, y:32 },
		
		collides: ig.Entity.COLLIDES.FIXED,
		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.NONE,

		health: 100,
		
		speed: 99,

		lastDirection: "down",

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			this.animSheet = new ig.AnimationSheet( 'media/player' + this.entType +  '.png', 32, 32 );	
	
			this.addAnim( 'up', .1, [ 0, 1 ] );  // 1
			this.addAnim( 'down', .1, [ 4, 5 ] ); // 2
			this.addAnim( 'left', .1, [ 6, 7 ] ); // 3		
			this.addAnim( 'right', .1, [ 2, 3 ] ); // 4
			
			this.addAnim( 'idleup', 1, [ 0 ] );  // 1
			this.addAnim( 'idledown', 1, [ 4 ] ); // 2
			this.addAnim( 'idleleft', 1, [ 6 ] ); // 3		
			this.addAnim( 'idleright', 1, [ 2 ] ); // 4

			this.currentAnim = this.anims.idledown;		


		},
		update: function() {

			this.parent();
			
		}
	})

});