ig.module(
	'game.entities.token'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
	
EntityToken = ig.Entity.extend({
	size: {x: 22, y: 22},
	offset: {x: 0, y: 0},
	maxVel: {x: 0, y: 0},

	zIndex: -12,
	type: ig.Entity.TYPE.B, 
	checkAgainst: ig.Entity.TYPE.A, 
	collides: ig.Entity.COLLIDES.NEVER,
	
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(244, 66, 146, 1)',
	
	health: 3000,
	
	tokenSound: new ig.Sound( 'media/sounds/coin.*' ),
	
	tokenAnim: new ig.AnimationSheet( 'media/token.png', 22, 22 ),
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		//Anims
		this.anims.token = new ig.Animation( this.tokenAnim,  0.1, [0,0,0,0,0,0,0,0,0,1,2,3,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4]);
		this.anims.tokenPaused = new ig.Animation( this.tokenAnim,  0.1, [0]);
	},
	
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
	},

			
	update: function() {
		this.animMe();
		this.parent();
	},
	animMe: function(){
		//Paused
		if (ig.game.pause){
			this.currentAnim = this.anims.tokenPaused 
		}
		else{
			this.currentAnim = this.anims.token;
		}
	},
	check: function( other ) {
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			if (other == player){
				//Increase token count
				ig.game.pData.tokens++;
				//Increase level token count
				ig.game.pData.tokensLT++;
				 
				 //play sound if not muted
				 if (!ig.game.muteGame){
					 this.tokenSound.volume = .15; 
					 this.tokenSound.play();
				}
				 //Do other things if you want.
				 
				this.kill();
			}
		}
	}
});
ig.EntityPool.enableFor( EntityToken );
});