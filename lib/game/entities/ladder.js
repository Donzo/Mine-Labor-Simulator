ig.module(
    'game.entities.ladder'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
   
EntityLadder = ig.Entity.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(255,0,255,0.5)',
	_wmScalable: true,
	size:{x:8,y:8},
	maxVel: {x: 000, y: 000},
	name: null,
	zIndex: 9,
	
	checkAgainst: ig.Entity.TYPE.A,
   
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		if (!ig.global.wm){
			this.setName();
		}
	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		if (!ig.global.wm){
			this.setName();
		}
	},
	update: function() {
		this.parent();
	},
	setName: function(){
		ig.game.ladderCount++;
		this.name = "ladder" + ig.game.ladderCount;
	},
   
	check:function(other){
		if ( ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			if (other == player){
				if (player.nearLadderTimer.delta() > -.06){
					player.nearLadderTimer.set(.1);
					player.ladderName = this.name;
					player.ladderTarget = this.pos.y;
					player.ladderX = this.pos.x;
				}
			}
		}
	}
});
	ig.EntityPool.enableFor( EntityLadder );

});