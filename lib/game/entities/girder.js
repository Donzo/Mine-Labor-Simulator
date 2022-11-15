ig.module(
	'game.entities.girder'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
	
EntityGirder = ig.Entity.extend({
	size: {x: 96, y: 16},
	offset: {x: 0, y: 0},
	maxVel: {x: 1000, y: 0},
	storeMaxVel: {x: 1000, y: 1000},
	storeVel: {x: null, y: null},

	zIndex: -11,
	bounciness: 0,
	landed: false,
	type: ig.Entity.TYPE.NONE, 
	checkAgainst: ig.Entity.TYPE.BOTH, 
	collides: ig.Entity.COLLIDES.FIXED,
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(66, 244, 125, 1)',

	gravityFactor: 0,
	pause: false,
	speed: 100,
	storedSpeed: 100,
	health: 3000,
	name: null,
	dir: null,
	wait: true,
	mySize: null,
	delay: null,
	
	animSheets: {
		regular: new ig.AnimationSheet( 'media/blue-girder.png', 96, 16 ),
		smaller: new ig.AnimationSheet( 'media/blue-girder-small.png', 48, 16 ),
		larger: new ig.AnimationSheet( 'media/blue-girder-larger.png', 192, 16 ),
		largest: new ig.AnimationSheet( 'media/blue-girder-largest.png', 384, 16 ),
		largester: new ig.AnimationSheet( 'media/blue-girder-largester.png', 768, 16 ),
	},

	
	//breakSound: new ig.Sound( 'media/sounds/brick-01.*' ),
	setName: function(){
		ig.game.girderCount++;
		this.name = "girder" + ig.game.girderCount;
	},
	setDelay: function(){
		if (this.delay){
			this.waitTimer.set(this.delay);
			this.pauseTimers();
		}
	},
	setSize: function(){
		if (this.mySize == "small"){
			this.size.x = 48;
		}
		else if (this.mySize == "large"){
			this.size.x = 192;
		}
		else if (this.mySize == "largest"){
			this.size.x = 384;
		}
		else if (this.mySize == "largester"){
			this.size.x = 768;
		}
		else{
			this.size.x = 96;	
		}
	},
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.switchDirectionsTimer = new ig.Timer(0);
		this.waitTimer = new ig.Timer(0);
		//Anims
		this.anims.regular = new ig.Animation( this.animSheets.regular, 1, [0], true );
		this.anims.smaller = new ig.Animation( this.animSheets.smaller, 1, [0], true );
		this.anims.larger = new ig.Animation( this.animSheets.larger, 1, [0], true );
		this.anims.largest = new ig.Animation( this.animSheets.largest, 1, [0], true );
		this.anims.largester = new ig.Animation( this.animSheets.largester, 1, [0], true );
		if (!ig.global.wm){
			this.setName();
			this.setSize();
			this.setDelay();
			this.setDir();
		}
		this.storedSpeed = this.speed;
		this.storedWaitSpeed = this.speed;
	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		if (!ig.global.wm){
			this.setName();
			this.setSize();
			this.setDelay();
			this.setDir();
		}
		this.storedSpeed = this.speed;
		this.storedWaitSpeed = this.speed;
	},
	setDir: function(){
		if (this.dir == "x"){
			this.maxVel.x = 1000;
			this.maxVel.y = 0;
		}
		else if (this.dir == "y"){
			this.maxVel.x = 0;
			this.maxVel.y = 1000;
		}
		else{
			this.kill();
		}
	},
	pauseTimers: function(){
		this.switchDirectionsTimer.pause();
		this.waitTimer.pause();
	},
	unpauseTimers: function(){
		this.switchDirectionsTimer.unpause();
		this.waitTimer.unpause();
	},
	paused: function(){
		//Capture Speed
		if (!this.storeVel.x){
			this.storeVel.x = this.vel.x; 	
		}
		if (!this.storeVel.y){
			this.storeVel.y = this.vel.y;	
		}
		this.vel.x = 0;
		this.vel.y = 0;
		this.maxVel.x = 0;
		this.maxVel.y = 0;
		this.storedSpeed = this.speed;
		this.pauseTimers();
		this.pause = true;
	},
	unpaused: function(){
		this.maxVel.x = this.storeMaxVel.x;
		this.maxVel.y = this.storeMaxVel.y;
		this.vel.x = this.storeVel.x;
		this.vel.y = this.storeVel.y;
		this.storeVel.x = null; 
		this.storeVel.y = null;
		this.unpauseTimers();
		this.pause = false;
	},
	update: function() {
		//Pause and Unpause
		if ( ig.game.pause && !this.pause || ig.game.getEntityByName('player') && ig.game.getEntityByName('player').landed != true ){
			this.paused();
		}
		else if (this.pause && !ig.game.pause){
			this.unpaused();	
		}
		this.checkCond();
		this.moveMe();
		this.animMe();
		
		this.parent();
	},
	moveMe: function(){
		if (this.pause || this.wait || ig.game.levelBeat ){
			this.vel.x = 0;
			this.vel.y = 0;
		}
		else if (this.dir == "x"){
			this.vel.x = this.speed;
		}
		else if (this.dir == "y"){
			this.vel.y = this.speed;
		}
	},
	checkCond: function(){
		if (this.wait && this.waitTimer.delta() > 0){
			this.wait = false;
			this.speed = this.storedWaitSpeed;
		}
	},
	animMe: function(){
		if (this.mySize == "small"){
			this.currentAnim = this.anims.smaller;
		}
		else if (this.mySize == "large"){
			this.currentAnim = this.anims.larger;
		}
		else if (this.mySize == "largest"){
			this.currentAnim = this.anims.largest;
		}
		else if (this.mySize == "largester"){
			this.currentAnim = this.anims.largester;
		}
		else{
			this.currentAnim = this.anims.regular;
		}
	},
	switchDirections: function(){
		if (!this.wait){
			
			if (ig.game.pData.timesPassed > 0){
				this.waitTimer.set(.05);	
			}
			else if (ig.game.pData.lvl <= 10){
				this.waitTimer.set(.5);
			}
			else if (ig.game.pData.lvl <= 20){
				this.waitTimer.set(.33);
			}
			else if (ig.game.pData.lvl <= 30){
				this.waitTimer.set(.2);
			}
			else if (ig.game.pData.lvl <= 40){
				this.waitTimer.set(.15);	
			}
			else{
				this.waitTimer.set(.1);		
			}
			this.wait = true;
			this.speed *=-1;
			this.storedWaitSpeed = this.speed;
			this.speed = 0;
			if (ig.game.getEntityByName('player')){
				var player = ig.game.getEntityByName('player');
				if (player.touchingGirder && player.girderName == this.name && this.dir == "x"){
					player.girderVelX *= -1;
					player.girderVelY *= -1;
					player.vel.x = 0;
					player.accel.x = 0;	
				}
			}
		}
	},
	squashed: function (dir){
		if (dir == "up" || dir == "down"){
			this.waitTimer.set(3);
			this.wait = true;
		}	
	},
	handleMovementTrace: function( res ) {
		if( res.collision.x && this.switchDirectionsTimer.delta() > 0 && this.dir == "x"){
			this.switchDirectionsTimer.set(.25);
			this.switchDirections();
		}
		if( res.collision.y && this.switchDirectionsTimer.delta() > 0 && this.dir == "y"){
			this.switchDirectionsTimer.set(.15);
			this.switchDirections();
		}
		//Continue resolving the collision as normal
		this.parent(res); 
	},
	check: function( other ) {
		if (ig.game.getEntityByName('player')){
			
			/*/Treadmill
			other.pos.x += this.vel.x * ig.system.tick;
			other.pos.y += this.vel.y * ig.system.tick;	*/
			
			var player = ig.game.getEntityByName('player');
			if (other == player ){
				if (player.onIce){
					player.endOnIce('girder');
				}
				if (player.touchingGirder != true){
					ig.game.landNoise();		
				}
				player.touchingGirder = true;
				player.touchingGirderDir = this.dir;
				player.girderName = this.name;
				var playerHoldCheck = this.pos.y + (this.size.y /2)
				if (player.girderTouchTimer.delta() >= -.05){
					player.girderTouchTimer.set(.1);
					if (player.pos.y + player.size.y - 1 < this.pos.y){
						player.girderLocation = "under";	
						if (this.dir == "y"){
							player.jumpCount = 0;
						}
					}
					else if (player.pos.y > playerHoldCheck){
						player.girderLocation = "over";
						if (this.wait){
							player.girderVelX = 0;
						}
						else{
							player.girderVelX = this.vel.x;
						}
						if (player.girderVelX > 0){
							player.girderDir = "right";
						}
						else if (player.girderVelX < 0){
							player.girderDir = "left";
						}
						else{
							player.girderDir = null;	
						}
						player.girderVelY = this.vel.y;
						if (this.dir == "y"){
							player.vel.x = 0;
						}
						//console.log('i am under the girder');
					}
				}
			}
			else if (other.name == "sight"){
				other.kill();	
			}
			else if (!other.landed && other.setRandomJumpTime && !other.onGirder){
				other.setRandomJumpTime('land');
				other.landed = true;	
				other.onGirder = true;
			}
		}
	}
	
});
ig.EntityPool.enableFor( EntityGirder );
});