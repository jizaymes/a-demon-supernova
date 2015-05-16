ig.module(
    'game.entities.hud'
)
.requires(
    'impact.entity'
)
.defines( function() {

EntityHud = ig.Entity.extend({

    size: { x: 160, y: 77 },
    zIndex: -100,
    collides: ig.Entity.COLLIDES.NEVER,
    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.NONE,
	    
    init: function( x, y, settings ) {    
	this.animSheet = new ig.AnimationSheet( 'media/backdrop.png', this.size.x , this.size.y );	
				
	this.addAnim( 'idle', 1, [ 0 ] );

	
	this.parent( x, y, settings );
	
    },
    update: function(){
        this.parent();
    },
    draw: function(reallyDraw){
    
    	if(reallyDraw ) {
	    if( typeof ig.game.getState === "function" ) { 
	        switch( ig.game.getState() )
	        {
	            case ig.game.gameState.WORLDMAP:
	            case ig.game.gameState.CHAT:
	            case ig.game.gameState.BUILDING:
	            case ig.game.gameState.CITY: // both pass through -- this is intentional
				ig.system.context.save();
			        ig.system.context.scale( 1.20,  1.20 );
				    
				// Set up local player variable					
				var player = ig.game.getEntitiesByType( EntityLocalPlayer )[0];

				// Draw HUD background
				var offsetX = player.HUD.X,
				    offsetY = player.HUD.Y;
				
        			    	this.pos.x = offsetX
				    	this.pos.y = offsetY;
					
					this.currentAnim = this.anims.idle;
					
					this.currentAnim.draw (this.pos.x, this.pos.y);
					
	
					// Set up floating settings object
					var settings = {color:null};
	
					//////// HP
	
					this.drawText( "HP", offsetX + 8, offsetY + 16 + 4, {color:'#CBCBFF'} );
	
						// Change color of HP as it runs out
	
						var healthPercent = player.params.curHP / player.params.maxHP;
						
						if ( healthPercent > 0.8) {
		
							settings.color = '#00FD00';
						}	else if (healthPercent > 0.6 ) {
		
							settings.color = '#F9D800';
							
						}	else if (healthPercent > 0.3 ) {
		
							settings.color = '#FF9800';
		
						}	else if (healthPercent > 0 ) {
		
							settings.color = '#FF0000';
						} // if healthPercent
	
					this.drawText( player.params.curHP.toString(), offsetX + 50, offsetY + 16 + 4, settings );
					
					
					//////// MP
	
					this.drawText( "MP", offsetX + 8, offsetY + 32 + 10, {color:'#CBCBFF'} );
	
						// Change color of MP as it runs out
	
						var magicPercent = player.curMP / player.maxMP;
											
						if ( magicPercent > 0.8) {
		
							settings.color = '#0000FF';
						}	else if (magicPercent > 0.6 ) {
		
							settings.color = '#00FFFF';
							
						}	else if (magicPercent > 0.3 ) {
		
							settings.color = '#004499';
		
						}	else if (magicPercent > 0 ) {
		
							settings.color = '#004444';
						} else { 
							settings.color = '#000044';
						} // if magicPercent
	
					this.drawText( player.params.curMP.toString(), offsetX + 50, offsetY + 32 + 10, settings );
					
					//////// XP
	
				
					this.drawText( "XP", offsetX + 78, offsetY + 16 + 4, {color:'#CBCBFF'} );
					this.drawText( player.params.xp + '/'+ eval(player.params.xp + ig.game.getXpToLevel(player.params.xp)).toString(), offsetX + 124, offsetY + 16 + 4 , {color:'#F9D800', center: 'true' } );
					
	
					//////// Gold
	
					this.drawText( "Gold", offsetX + 78, offsetY + 32 + 10, {color:'#CBCBFF' } );
					this.drawText( player.params.gold.toString(), offsetX + 124, offsetY + 32 + 10, {color:'#999900',center:'true' } );				
					
					//////// Level
	//				console.log(offsetY + 205);
					this.drawText( player.params.level.toString(), offsetX + 77, offsetY + 68, { 
						color:'#161616',
						center:'true',
						shadowColor:'#ABABAB',
						size: 12.5 * ig.system.scale,
						name:'Metal Mania',
						style: 'bold'
					} );				
	
					ig.system.context.restore();
	                break;
	            default:
					
	                break;
		        } // switch
			} // typeof
		  } // reallyDraw		                   
	    },
	    drawText: function(text,x,y,settings) {
	    
				if( typeof settings.size === "undefined" ) {
					settings.size = (16 * ig.system.scale);
				}
				
				if( typeof settings.style === "undefined" ) {
					settings.style = 'bold';
				}
	
				if( typeof settings.name === "undefined" ) {
					settings.name = 'Metal Mania';
				}
										
						if ( text.length > 10 ) {
								if( settings.center != 'false' && settings.center ) {
									x -= ( settings.size / 2) + 1;
								}
					
								settings.size *= 0.475;
								
								y -= 6;
						} else if ( text.length > 6 ) {
								if( settings.center != 'false' && settings.center ) {
									x -= text.length + (settings.size / 2);
								}
								
								settings.size *= 0.64;
								y -= 1;							
						} else if ( text.length > 3 ) {
								if( settings.center != 'false' && settings.center ) {
	
									x -= text.length + (settings.size / 3);
								}
	
								settings.size *= 0.75;
								y -= 1;
						} else if ( text.length > 1 ) {
								if( settings.center != 'false' && settings.center ) {
									x -= text.length * (text.length/2);
								}
						} else {
								//no op
						}
	
					ig.system.context.font = settings.style + ' ' + settings.size.toString() + 'px ' + settings.name;
	
					if(!settings.color) {
						settings.color = '#004400';
					}			
	
					// handle justification
					
	
					if(!settings.shadowColor) {
						settings.shadowColor = 'rgba(0,0,0,.5)'
					}
					
					ig.system.context.fillStyle = settings.shadowColor;
					
//					var offsetX = (settings.size / ig.system.scale) + (text.length / (settings.size / ig.system.scale));
					
					ig.system.context.fillText( text, x + 2, y + 2 );
	
					ig.system.context.fillStyle = settings.color;
					ig.system.context.fillText( text, x, y );

    
    }

});
});