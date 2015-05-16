ig.module( 
    'game.entities.zone-banner' 
)
.requires(
    'impact.entity'
)
.defines(function(){

	EntityZoneBanner = ig.Entity.extend({
        _wmDrawBox: true,
        _wmScalable: true,
        _wmBoxColor: 'rgba(64, 146, 255, 0.7)',
	message: null,
        size: {x: 160, y: 57},
  		bannerTimer: new ig.Timer(),
  		pos: {x:null, y:null },
  		orig: {x: null, y: null },
        checkAgainst: ig.Entity.TYPE.BOTH,

		img: new ig.Image( 'media/zoneBanner.png' ),
		loadingTime: 2.2,
		loadingInterval: 0.05,
		times: 0,
		alpha: 1,
        init: function(x, y, settings){
            this.parent(x, y, settings);
            this.orig.x = (ig.system.width / 2);
            this.orig.y = (ig.system.height / 14);

            this.pos.x = this.orig.x -  (this.img.width / 2);
            this.pos.y = this.orig.y - (this.img.height / 2);
			
			ig.game.zoneBannerEntity = this;

			this.bannerTimer.set(this.loadingInterval);

		},
		update: function() {
			this.parent();

			if(this.bannerTimer.delta() > 0  ) {			

				this.bannerTimer.reset();

				var steps = (this.loadingTime / this.loadingInterval);
				this.alpha = 1 - (this.times/steps);
				
				if ( this.times >= steps ) {
					this.alpha = 0;
					ig.game.zoneBannerEntity = null;
					this.kill();
				}					

				this.times++;								
			}
			
		},
		draw: function(whatToDraw) {
			if(whatToDraw) {
			
				ig.system.context.save();

				ig.system.context.globalAlpha = this.alpha;
				
				this.img.draw( this.pos.x, this.pos.y );

				this.drawText(whatToDraw, this.orig.x - ((16 * ig.system.scale) + (whatToDraw.length*1.5)) , this.orig.y + (9 * ig.system.scale), {
						color:'#CBCBFF', 
						center:'true',
						shadowColor:'#141414',
						size: 35 * ig.system.scale,
						name:'Metal Mania',
						style: 'bold'
					} );			
				
				ig.system.context.restore();		
				this.parent();
			}


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
							x -=  settings.size ;
						}
			
						settings.size *= 0.65;
						
						y -= 2;
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
				settings.shadowColor = '#000000'
			}
			
			ig.system.context.fillStyle = settings.shadowColor;
						
			ig.system.context.fillText( text, x + 2, y + 2 );

			ig.system.context.fillStyle = settings.color;
			ig.system.context.fillText( text, x, y );

		}
	})

});