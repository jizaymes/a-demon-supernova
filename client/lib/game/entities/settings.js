ig.module( 
    'game.entities.settings' 
)
.requires(
    'impact.entity'
)
.defines(function(){

	EntitySettings = ig.Entity.extend({
        _wmDrawBox: true,
        _wmScalable: true,
        _wmBoxColor: 'rgba(64, 146, 255, 0.7)',

        size: {x: 64, y: 64},
  
        checkAgainst: ig.Entity.TYPE.BOTH,

  
        init: function(x, y, settings){
            this.parent(x, y, settings);
		},
		update: function() {
		}
	})

});