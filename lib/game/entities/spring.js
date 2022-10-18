ig.module(
	'game.entities.spring'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
	
EntitySpring = ig.Entity.extend({
	size: {x: 24, y: 24},
	maxVel: {x: 0, y: 0},
	offset: {x: 1, y: -2},
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.NONE, // Check against friendly
	collides: ig.Entity.COLLIDES.FIXED,
	zIndex: -11,
	animSheet: new ig.AnimationSheet( 'media/spring.png', 24, 54 ),
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.addAnim( 'set', 1, [0] );
		this.addAnim( 'fire1', 1, [1] );
		this.addAnim( 'fire2', 1, [2] );
		this.addAnim( 'fired', 1, [3] );
		this.springTimer = new ig.Timer(0);
		var myName = "spring" + ig.game.springCount;
		this.name = myName;
		if( !ig.global.wm ) { // not in wm?
			ig.game.spawnEntity( EntitySpringTarget, this.pos.x + 3, this.pos.y-2, {parentName: this.name});
			ig.game.springCount++;
			this.startingPosY = this.pos.y + this.size.y;
		}
	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		var myName = "spring" + ig.game.springCount;
		this.name = myName;
		ig.game.spawnEntity( EntitySpringTarget, this.pos.x + 3, this.pos.y-2, {parentName: this.name});
		ig.game.springCount++;
		this.startingPosY = this.pos.y + this.size.y;
	},
	findDiff: function(oldSize, newSize){
		return (oldSize - newSize) * -1;
	},
	update: function() {		
		
		if (this.triggered ){
			if (this.springTimer.delta() <= -.45){
				if (this.size.y != 32){
					this.size.y = 32;
					this.pos.y = this.startingPosY - this.size.y;
				}
				this.currentAnim = this.anims.fire1;
			}
			else if (this.springTimer.delta() <= -.4){
				if (this.size.y != 41){
					this.size.y = 41;
					this.pos.y = this.startingPosY - this.size.y;
				}
				this.currentAnim = this.anims.fire2;
			}
			else if (this.springTimer.delta() <= -.15){
				if (this.size.y != 54){
					this.size.y = 54;
					this.pos.y = this.startingPosY - this.size.y;
				}
				this.currentAnim = this.anims.fired;
			}
			else if (this.springTimer.delta() <= -.05){
				if (this.springTimer.delta() <= -.15){
					if (this.size.y != 41){
						this.size.y = 41;
						this.pos.y = this.startingPosY - this.size.y;
					}
					this.currentAnim = this.anims.fire2;
				}
				else if (this.springTimer.delta() <= -.1){
					if (this.size.y != 32){
						this.size.y = 32
						this.pos.y = this.startingPosY - this.size.y;
					}
					this.currentAnim = this.anims.fire1;
				}
			}
			else if(this.springTimer.delta() <= 0){
				this.triggered = false;
				if (this.size.y != 24){
					this.size.y = 24;
					this.pos.y = this.startingPosY - this.size.y;
				}
				this.currentAnim = this.anims.set;
			}
		}
		else{
			this.currentAnim = this.anims.set;
			if (this.size.y != 24){
				this.size.y = 24;
				this.pos.y = this.startingPosY - this.size.y;
			}
		}
		this.parent();
	}
});
EntitySpringTarget = ig.Entity.extend({
	size: {x: 18, y: 28},
	maxVel: {x: 0, y: 0},
	offset: {x: 0, y: -2},
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.NONE,
	parentName: null,
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.springTimer = new ig.Timer(0);
	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
	},
	
	update: function() {		
		
		
		this.parent();
	},
	check: function( other ) {
		// The instanceof should always be true, since the player is
		// the only entity with TYPE.A - and we only check against A.
		if( other instanceof EntityPlayer ) {
			var player = ig.game.getEntityByName('player');
			if (!player.victoryDance && !player.dying ){
				if (player.onIce){
					player.endOnIce('spring');
				}
				var myParent = ig.game.getEntityByName(this.parentName);
				var springY = myParent.pos.y;
				var playerY = player.pos.y + player.size.y * .9;
				if (!myParent.triggered && playerY <= springY){
					myParent.triggered = true;
					myParent.springTimer.set(ig.game.shortSpringTime);
					if (ig.input.state('jump') || ig.input.pressed('jump') || ig.input.released('jump')){
						player.onSpringTimer.set(ig.game.longSpringTime);
						player.jumpCount++;
						
						ig.game.bounceNoise();
						
					}
					else{
						player.onSpringTimer.set(ig.game.shortSpringTime);
						player.jumpCount++;
						
						ig.game.superBounceNoise();
						
					}
					player.onSpring = true;
				}
			}
		}
	}
});
ig.EntityPool.enableFor( EntitySpring );
});