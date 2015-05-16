ig.module( 
    'game.entities.local-player'
)
.requires(
    'game.entities.player'
)
.defines(function(){

	EntityLocalPlayer = EntityPlayer.extend({
	
		_wmIgnore: true,		
		size: { x:32, y:32 },
		
		// Does the local keyboard move the player?
		controlledByLocalKeyboard: true,
				
		collides: ig.Entity.COLLIDES.ACTIVE,
		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.NONE,
					
		params: null,			
		
		defaultSpeed: 150,
		speed: 150,
		maxVel: {x: 150, y: 150},
	
		healthRegen: null,
		magicRegen: null,
		
		facing: "down",
		escPressed: false,
		zIndex: 100,
		
		chatBubble: undefined,
		
		HUD: {X: 5, Y: 5},
		hudEntity: null,
		zoneBannerEntity: null,
				
		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			
			this.params = settings.params;

			this.healthRegen = new ig.Timer ( 10 );
			this.magicRegen = new ig.Timer ( 10 );
				
		},
		setupPlayer: function() {
			this.pos.x = this.params.lastX > 0 ? this.params.lastX : ig.game.getEntitiesByType( EntitySettings)[0].start.x;
			this.pos.y = this.params.lastY > 0 ? this.params.lastY : ig.game.getEntitiesByType( EntitySettings)[0].start.y;				
				

			if(this.pos.x.round() - ig.system.width/2 > 0) {
			    ig.game.screen.x = this.pos.x.round() - ig.system.width/2;
			} else {
				ig.game.screen.x = 0;
			}
				
			if(this.pos.y.round() - ig.system.height/2 > 0) {				
			    ig.game.screen.y = this.pos.y.round() - ig.system.height/2;
			} else {
				ig.game.screen.y = 0;
			}
		
			this.hudEntity = ig.game.spawnEntity(EntityHud, 0, 0);
			
			ig.game.lastEntities.push ( this.hudEntity );
			
			var zoneBanner = ig.game.spawnEntity( EntityZoneBanner, ig.system.width/2 - (240/2) ,ig.system.height/2 - (57/2), {zIndex:1, message: ""});

			ig.game.setState( eval(ig.game.getEntitiesByType( EntitySettings )[0].gameState) );	
					
			var playerImage = 'media/player' + this.params.class +  '.png'

			this.animSheet = new ig.AnimationSheet( playerImage , 32, 32 );	
				
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
			ismove = 0;
					
			if (this.params.curHP < this.params.maxHP && this.healthRegen.delta() > 0) {
				this.params.curHP += 1;
				this.healthRegen.reset();				
			}

			if (this.params.curMP < this.params.maxMP && this.magicRegen.delta() > 0) {
				this.params.curMP += 1;
				this.magicRegen.reset();				
			}

			
			if( ig.game.getState() != ig.game.gameState.OPTIONSMENU && ig.game.getState() != ig.game.gameState.CHAT ) {

				if( ig.input.released( 'speak' ) ) {

					if( ig.game.getState() != ig.game.gameState.CHAT ) {	
						// Make input visible.
						$('#input').fadeIn(100);

						// Set focus.
						$('#input').focus();

						// Prevent opening when it's already open.
						ig.game.setState( ig.game.gameState.CHAT );
					}
				}						
				else if( ig.input.pressed( 'mouseclick' ) ) {	            

					this.destinationx = ig.input.mouse.x + ig.game.screen.x;
					this.destinationy = ig.input.mouse.y + ig.game.screen.y;
		
					// Show mouse click ping
			            ig.game.spawnEntity( EntityClicklocation, this.destinationx - 6, this.destinationy - 10, {zIndex:1} );

				} else if( ig.input.state( 'up' ) && ismove != 2 /*&& ismove != 2 && ismove != 4 */) {
					this.vel.y = -this.speed;
					this.vel.x = 0;
					ismove = 1;
					this.currentAnim = this.anims.up;
					this.facing = "up";

					//set this.destinationx and dthis.destination y is for the movement by mouse-click
					this.destinationx = 99999999;
					this.destinationy = 99999999;					
				}
				else if ( ig.input.state( 'down' ) && /*ismove != 3 && */ ismove != 1 /*&& ismove != 4*/ ) {
					this.vel.y = this.speed;

					this.vel.x = 0;
					ismove = 2;
					this.currentAnim = this.anims.down;				
					this.facing = "down";

					//set this.destinationx and dthis.destination y is for the movement by mouse-click
					this.destinationx = 99999999;
					this.destinationy = 99999999;					

				}
				else if ( ig.input.state( 'left' ) /*&& ismove != 1 && ismove != 2 */ &&  ismove != 4) {
					this.vel.x = -this.speed;
					this.vel.y = 0;
					ismove = 3;
					this.currentAnim = this.anims.left;				
					this.facing = "left";

					//set this.destinationx and dthis.destination y is for the movement by mouse-click
					this.destinationx = 99999999;
					this.destinationy = 99999999;					

				}
				else if ( ig.input.state( 'right' ) && ismove != 3 /* && ismove != 2 && ismove != 1 */) {
					this.vel.x = this.speed;
					this.vel.y = 0;
					ismove = 4;
					this.currentAnim = this.anims.right;				
					this.facing = "right";

					//set this.destinationx and dthis.destination y is for the movement by mouse-click
					this.destinationx = 99999999;
					this.destinationy = 99999999;					
					
				}
				else if( ig.input.released( 'escape' ) ) {
					console.log('escape pressed');
					this.vel.y = 0;
					this.vel.x = 0;
					this.escPressed = true;
				}
				else {
        		
        			// Click based movement
				        if( this.destinationx < 9999999 && this.destinationy < 9999999 && this.escPressed != true ) { 
				        this.distancetotargetx = this.destinationx - this.pos.x - (this.size.x / 2);
				        this.distancetotargety = this.destinationy - this.pos.y - this.size.y;    
				                
				                
				            // If its not right next to us
					        if ( Math.abs( this.distancetotargetx ) > 1 || Math.abs( this.distancetotargety ) > 1 ) {    
					                    
					                // is the destination to our left or right
						            if ( Math.abs( this.distancetotargetx ) > Math.abs( this.distancetotargety ) ) {
						                            
								            if ( this.distancetotargetx > 1 ) {
								              this.vel.x = this.speed;
								              this.xydivision = this.distancetotargety / this.distancetotargetx;
								              this.vel.y = this.xydivision * this.speed;    
								              ismove = 4;
								              this.currentAnim = this.anims.right;
								              this.facing = 'right';				                    
								            }
								            else {                 
								              this.vel.x = -this.speed;
								              this.xydivision = this.distancetotargety / Math.abs(this.distancetotargetx);
								              this.vel.y = this.xydivision * this.speed;
								              ismove = 3;
								              this.currentAnim = this.anims.left;
								              this.facing = 'left';
								            }
							        }
						            else {
						            // or up or down
								            if (this.distancetotargety > 1 ) {            
								                this.vel.y = this.speed;
								                this.xydivision = this.distancetotargetx / this.distancetotargety;
								                this.vel.x = this.xydivision * this.speed;
								                ismove = 2
								                this.currentAnim = this.anims.down;
								                this.facing = 'down';
								            }
								            else {
								                this.vel.y = -this.speed;
								                this.xydivision = this.distancetotargetx / Math.abs( this.distancetotargety );
								                this.vel.x = this.xydivision * this.speed;
								                ismove = 1;
								                this.currentAnim = this.anims.up;
								                this.facing = 'up';
								            }
						            }
					        }
					        else {
								this.vel.x = 0;
								this.vel.y = 0;
								ismove = 0;

								this.escPressed = false;
								
								//console.log("this one");
								this.currentAnim = eval('this.anims.idle' + this.facing);
			
			    			    this.destinationx = 99999999;
					    	    this.destinationy = 99999999;
					        }
					}
					else {
						this.vel.x = 0;
						this.vel.y = 0;
						ismove = 0;
						this.escPressed = false;

								//console.log("that one");
						this.currentAnim = eval('this.anims.idle' + this.facing);
	
						this.destinationx = 99999999;
						this.destinationy = 99999999;
					}
				}
			

			} 
		
			
/*
				// Turn off options menu
				if ( ig.input.released( 'optionsmenu' ) && ig.game.getState() == ig.game.gameState.OPTIONSMENU && this.optionsReady) {
//					console.log("Options Menu Hit Off");
	
					ig.game.setState( ig.game.getLastState() );
					this.optionsReady = false;
					this.optionsTimer.reset();
					
				} 
	
				// Turn on options menu			
				if ( ig.input.released( 'optionsmenu' ) && ig.game.getState() != ig.game.gameState.OPTIONSMENU && this.optionsReady ) {
//					console.log("Options Menu Hit On");
	
					ig.game.setState( ig.game.gameState.OPTIONSMENU );
					
					this.optionsReady = false;
					this.optionsTimer.reset();
				} 

				
				// If the action button is clicked while int the options menu
				if ( ( ig.input.released( 'actionbutton' ) ) && ig.game.getState() == ig.game.gameState.OPTIONSMENU && this.optionsReady ) {
					console.log("Action button hit while in options menu");
				}

			if( !this.optionsReady && this.optionsTimer.delta() > .25 ) {
//					console.log("now");
					this.optionsReady = true;
					this.optionsTimer.reset();
					this.optionsTimer.pause();
			}
*/

			
			// Center the screen around the player			
			if(ismove > 0) { 
			    
					if(this.pos.x.round() - ig.system.width/2 > 0) {
					    ig.game.screen.x = this.pos.x.round() - ig.system.width/2;
					} else {
					    ig.game.screen.x = 0;
					}
					
					if(this.pos.y.round() - ig.system.height/2 > 0) {				
					    ig.game.screen.y = this.pos.y.round() - ig.system.height/2;
					} else {
					    ig.game.screen.y = 0;
					}

			}


			this.parent();
		
		},
		warpTo: function( x, y, gameState, banner ) {
			
			this.vel.x = 0;
			this.vel.y = 0;
			this.speed = this.defaultSpeed;

			this.pos.x = x;
			this.pos.y = y;
			
			var zoneBanner = ig.game.spawnEntity( EntityZoneBanner, ig.system.width/2 - (240/2) ,ig.system.height/2 - (57/2), {zIndex:1, message: banner });
			
			this.destionationx = 9999999;
			this.destinationy = 9999999;
			
			if(this.pos.x.round() - ig.system.width/2 > 0) {
			    ig.game.screen.x = this.pos.x.round() - ig.system.width/2;
			} else {
				ig.game.screen.x = 0;
			}
			if(this.pos.y.round() - ig.system.height/2 > 0) {				
			    ig.game.screen.y = this.pos.y.round() - ig.system.height/2;
			} else {
				ig.game.screen.y = 0;
			}							
			
			
			ig.game.setState( gameState );
							
		},
		speak: function (what) {
				// Kill existing chat bubble.
				if (typeof this.chatBubble != 'undefined') {
					this.chatBubble.kill();
					this.chatBubble = undefined;
				}

				// Display new local chat bubble.
				this.chatBubble = ig.game.spawnEntity(
				EntityChatBubble, this.pos.x, this.pos.y, {

					// Entity to follow.
					follow: this,

					// Message.
					msg: this.params.name + ': ' + what
				});

		
		
		},
		receiveDamage: function (damage) {
			this.params.curHP -= damage;
		},
		kill: function() {
			if ( ig.game.getState() != ig.game.gameState.LOADING ) {
				if( this.params.curHP <= 0 ) {
					console.log('you\'re dead bro');

					//we're dead
				}
			}
			
			//console.log('deleting');
			//delete this.hudEntity;
			this.parent();			
		}
})


EntityClicklocation = ig.Entity.extend({
    size: {x:16, y:16},
    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.NONE,
   
    animSheet: new ig.AnimationSheet('media/ping.png', 16, 16),
    time: null,
    
    init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.time = new ig.Timer(0.4);
		this.time.reset();
		this.time.pause();
		
		this.addAnim('click', 0.1, [0, 1, 2, 3]);        
		
		//console.log("Init Entity");
		this.currentAnim = this.anims.click;
		this.time.unpause();
    },
    update: function() {
    	if( this.time.delta() > 0 ) {
	//	console.log("Kill entity");
			this.kill(); 
			this.time.reset();
			this.time.pause();
    	}
		
	this.parent();    
    }
});
});