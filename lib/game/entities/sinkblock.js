ig.module(
	'game.entities.sinkblock'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
	
EntitySinkblock = ig.Entity.extend({
	size: {x: 32, y: 32},
	offset: {x: 0, y: 0},
	maxVel: {x: 0, y: 0},
	storeMaxVel: {x: 0, y: 1000},
	storeVel: {x: null, y: null},

	zIndex: -10,
	bounciness: 0,
	landed: false,
	type: ig.Entity.TYPE.NONE, 
	checkAgainst: ig.Entity.TYPE.BOTH, 
	collides: ig.Entity.COLLIDES.FIXED,
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(244, 244, 66, 1)',

	gravityFactor: 0,
	pause: false,
	speed: 100,
	storedSpeed: 100,
	health: 3000,
	name: null,
	dir: "y",
	wait: true,
	mySize: null,
	delay: null,
	bw: true,
	returnPosX: null,
	returnPosY: null,
	dropping: false,
	dropSpeed: 100,
	rising: false,
	riseResetTime: 2,
	sinkSoundLooping: false,
	riseSoundLooping: false,
	
	sinkSound: new ig.Sound( 'media/sounds/sinkblock.*' ),
	riseSound: new ig.Sound( 'media/sounds/sinkblock-rise.*' ),
	
	animSheets: {
		regular: new ig.AnimationSheet( 'media/sink-block.png', 32, 32 ),
		bw: new ig.AnimationSheet( 'media/sink-block-bw.png', 32, 32 ),
	},
	setDrop: function(){
		this.dropping = true;
		this.dropTimer.set(.15);
	},
	
	//breakSound: new ig.Sound( 'media/sounds/brick-01.*' ),
	setName: function(){
		ig.game.sinkBlockCount++;
		this.name = "sinkblock" + ig.game.sinkBlockCount;
	},
	setDelay: function(){
		if (this.delay){
			this.waitTimer.set(this.delay);
			this.pauseTimers();
		}
	},
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.dropTimer = new ig.Timer(0);
		this.waitTimer = new ig.Timer(0);
		this.riseTimer = new ig.Timer(0);
		//Anims
		this.anims.regular = new ig.Animation( this.animSheets.regular, 1, [0], true );
		this.anims.bw = new ig.Animation( this.animSheets.bw, 1, [0], true );

		if (!ig.global.wm){
			this.setName();
			this.setDelay();
			this.setReturnPos();
		}
		this.storedSpeed = this.speed;
	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		if (!ig.global.wm){
			this.setName();
			this.setDelay();
			this.setReturnPos();
		}
		this.storedSpeed = this.speed;
	},
	setReturnPos: function(){
		this.returnPosX = this.pos.x;
		this.returnPosY = this.pos.y;
	},
	pauseTimers: function(){
		this.dropTimer.pause();
		this.waitTimer.pause();
		
	},
	unpauseTimers: function(){
		this.dropTimer.unpause();
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
	startSound: function(){
		if (!this.sinkSoundLooping){
			this.sinkSoundLooping = true;	
			if (!ig.game.muteGame){
				this.sinkSound.loop = true;
				this.sinkSound.volume = .02; 
				this.sinkSound.play();
			}
		}		
	},
	stopSound: function(){
		if (this.sinkSoundLooping){
			this.sinkSoundLooping = false;	
			this.sinkSound.stop();
		}	
	},
	stopRiseSound: function(){
		if (this.riseSoundLooping){
			this.riseSoundLooping = false;	
			this.riseSound.stop();
		}	
	},
	startRiseSound: function(){
		if (!this.riseSoundLooping){
			this.riseSoundLooping = true;	
			if (!ig.game.muteGame){
				this.riseSound.loop = true;
				this.riseSound.volume = .015; 
				this.riseSound.play();
			}
		}		
	},
	moveMe: function(){
		if (this.pause || this.wait){
			this.vel.x = 0;
			this.vel.y = 0;
		}
		else if (this.dropping){
			this.vel.y = this.dropSpeed;
			this.stopRiseSound();
			this.startSound();
		}
		else if (this.rising && this.riseTimer.delta() >0){
			this.vel.y = -(this.dropSpeed / 2);
			this.startRiseSound();
		}
		else{
			this.vel.x = 0;
			this.vel.y = 0;
		}
		//Stop me from sinking if player wins
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			if (player.victoryDance){
				this.vel.x = 0;
				this.vel.y = 0;	
			}
		}
	},
	checkCond: function(){
		//Delay
		if (this.wait && this.waitTimer.delta() > 0){
			this.wait = false;	
		}
		//Rise
		if (this.dropping && this.dropTimer.delta() > 0){
			this.dropping = false;
			this.rising = true;
			this.stopSound();
		}
		else if (this.dropping){
			this.startSound();
		}
		//Reset position and turn off rise
		if (this.rising && this.pos.y <= this.returnPosY){
			this.rising = false
			this.pos.y = this.returnPosY;
			this.stopRiseSound();
		}
		if (ig.game.quiz || ig.game.transition || ig.game.deathScreen || ig.game.levelBeat ){
			this.stopRiseSound();
			this.stopSound();
		}
	},
	animMe: function(){
		 if (this.bw == true){
			this.currentAnim = this.anims.bw;
		}
		else{
			this.currentAnim = this.anims.regular;
		}
	},
	squashed: function (){
		this.waitTimer.set(3);
		this.wait = true;
		//this.collides = ig.Entity.COLLIDES.NEVER;
		// this.collides = ig.Entity.COLLIDES.FIXED;
	},
	handleMovementTrace: function( res ) {

		if( res.collision.y && this.dropping){
			this.stopSound();
		}
		if( res.collision.y && this.rising){
			this.stopRiseSound();
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
				this.riseTimer.set(this.riseResetTime);
				//Let's try to use girder touch and see how it goes.
				player.touchingSinkBlock = true;
				player.sinkBlockName = this.name;
				if (player.onIce){
					player.endOnIce('sink block');
				}
				
				var playerHoldCheck = this.pos.y + (this.size.y * .75)
				
				if (player.sinkBlockTouchTimer.delta() >= -.1){
					player.sinkBlockTouchTimer.set(.15);
					if (player.pos.y + player.size.y - 1 < this.pos.y){
						player.sinkBlockLocation = "under";	
						player.sinkBlockVelY = this.vel.y;
						player.jumpCount = 0;
						this.setDrop();
						//console.log('player is over the sinkblock');
					}
					else if (player.pos.y > playerHoldCheck){
						player.sinkBlockLocation = "over";	
						//player.girderVelX = this.vel.x;
						player.sinkBlockVelY = this.vel.y;
						this.setDrop();
						//console.log('i am under the sinkblock');
					}
					else if (player.pos.y >= this.pos.y ){
						//console.log('you on the side bruh.');
						player.activateWallMode(player.vel.x);
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
				console.log('on the sink block');
			}
		}
	}
	
});
ig.EntityPool.enableFor( EntitySinkblock );
});