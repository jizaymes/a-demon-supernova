ig.module(
    'game.entities.zone'
).requires(
    'impact.entity'
)
.defines(function() {
    EntityZone = ig.Entity.extend({
        _wmDrawBox: true,
        _wmScalable: true,
	
        size: {x: 16, y: 16},
	
        checkAgainst: ig.Entity.TYPE.BOTH,
	
	tim: null,
	
        init: function(x, y, settings){
            this.parent(x, y, settings);
	    
	    this.tim = new ig.Timer( 0.50 );
			
            switch(this.type) {
		
            	case "damage":
			        this._wmBoxColor = 'rgba(0, 0, 255, 0.7)';
            		break;
            	case "portal":
			        this._wmBoxColor ='rgba(0, 255, 255, 0.7)';
			      	break;
            	case "warp":
			        this._wmBoxColor ='rgba(128, 128, 255, 0.7)';
			      	break;		      	
            	case "warpLanding":
			        this._wmBoxColor ='rgba(128, 255, 255, 0.7)';
			      	break;		      	
            	case "portalLanding":
			        this._wmBoxColor ='rgba(128, 64, 128, 0.7)';
			      	break;		      	
            	default:
			        this._wmBoxColor ='rgba(255, 0, 255, 0.7)';
			      	break;
            }
        },
	
      check: function(other) {
      
// 		if we want to not kill people if the chat window is open... not sure on this
//      	if( ig.game.getState() == ig.game.gameState.CHAT ) { this.tim.reset(); return false; }
      	
	    // Check to see if its a player
            if( other instanceof EntityLocalPlayer ) {
            
            	// If the recheck interval hits... this is kindof buggy in that if you're on two tiles, it fires twice
            	
	        	if( this.tim.delta() > 0 ) {
				//	console.log('Colliding with '  + other.name + ' / Zone Type: ' + this.type);


	        		switch(this.type) {
    	    		
        			case "damage":
			               other.receiveDamage(this.damageAmount);                
			
		  					other.speed = other.defaultSpeed * 0.30;
				//			console.log("Slowing down player " + other.speed);
						break;
					case "warp":
							var warpLanding = ig.game.getEntitiesByType ( EntityZone );
							
							for (var zoneCount = 0; zoneCount < warpLanding.length; zoneCount++ ) {
							
								if( warpLanding[zoneCount].type == "warpLanding" && warpLanding[zoneCount].name == this.warpTarget.name ) {
									other.warpTo( warpLanding[zoneCount].pos.x, warpLanding[zoneCount].pos.y, eval(this.warpTarget.gameState), this.warpTarget.properName );					
									return; 
								}
							}

							
							break;							
					case "warpLanding":
					case "portalLanding":
							// no op							
							break;							
					case "portal":
							other.vel.x = 0;
							other.vel.y = 0;
							ig.game._params = other.params;							
    							ig.game.changeLevel( eval(this.portalTarget.level), { x: this.portalTarget.x, y: this.portalTarget.y } );
							return;
							break;
					default: // reset or default
						if (other.speed != other.defaultSpeed) { 
							other.speed = other.defaultSpeed;
				//			console.log('Settings speed to: ' + other.speed);
						}
						break;

        			}
        			
 					this.tim.reset();	
				}



			}			
            this.parent();
        }
    });
});