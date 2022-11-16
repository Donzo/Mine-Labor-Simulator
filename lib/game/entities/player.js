ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){

EntityPlayer = ig.Entity.extend({

	name:"player",
	
	size: {x: 15, y: 44},
	offset: {x: 8, y: 7},
	friction: {x: 4000, y: 0},
	frictionStore: 4000,
	storeVel: {x: 0, y: 0},
	maxVel: {x: 400, y: 1000},
	maxVelStore: {x: 400, y: 1000},
	maxX: 400,
	maxY: 1000,
	maxJumps: 1,
	jumpCount: 0,

	accelGround: 600,
	accelAir: 600,
	
	attackLimit: .15,
	
	jump: 750,
	health: 100,
	
	gravityFactor: 1,
	theGravityFactor: 1,
	
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(245, 66, 212, 1)',
	
	type: ig.Entity.TYPE.A, 
	
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	pause: false,
	flip: false,
	zIndex: 10,
	
	landed: false,
	easyJumps: false,
	alive: true,
	dying: false,
	victory: false,
	invin: true,
	invinTime: 2,
	readyBro: true,
	deathMode: null,
	ceilingMode: false,
	readyToClimb: true,
	attacking: false,
	ladderName: null,
	ladderX: null,
	ladderTarget: null,
	touchingGirder: false,
	touchingGirderDir: null,
	holdingGirder: false,
	noJump: false,
	
	ladderSound: new ig.Sound( 'media/sounds/ladder-01.*' ),
	
	animSheets: {
		player: new ig.AnimationSheet( 'media/player-01.png', 36, 54 ),
		playerClimb: new ig.AnimationSheet( 'media/player-02.png', 36, 54 ),
		playerFight: new ig.AnimationSheet( 'media/player-03.png', 60, 62 ),
		playerDeath: new ig.AnimationSheet( 'media/player-death.png', 44, 41 ),
	},
	
	unpauseTimers: function(){
		this.attackTimer.unpause();
		this.ceilingModeTimer.unpause();
		this.gettingOffLadderTimer.unpause();
		this.girderTouchTimer.unpause();
		this.holdGirderTimer.unpause();
		this.holdingSinkBlockTimer.unpause();
		this.sinkBlockTouchTimer.unpause();
		this.iceTimer.unpause();
		this.invincibleTimer.unpause();
		this.nearLadderTimer.unpause();
		this.onSpringTimer.unpause();
		this.onSpikesTimer.unpause();
		this.reclimbTimer.unpause();
		this.spikeTimer.unpause();
		this.wallBounceTimer.unpause();
		this.noJumpTimer.unpause();
		
		if (ig.game.flashingMessage){
			ig.game.flashingMessageTimer.unpause();
			ig.game.flashingMessageIntravelTimer.unpause();
		}
	},
	pauseTimers: function(){
		this.attackTimer.pause();
		this.ceilingModeTimer.pause();
		this.holdGirderTimer.pause();
		this.holdingSinkBlockTimer.pause();
		this.gettingOffLadderTimer.pause();
		this.girderTouchTimer.pause();
		this.sinkBlockTouchTimer.pause();
		this.iceTimer.pause();
		this.invincibleTimer.pause();
		this.nearLadderTimer.pause();
		this.onSpringTimer.pause();
		this.onSpikesTimer.pause();
		this.reclimbTimer.pause();
		this.spikeTimer.pause();
		this.wallBounceTimer.pause();
		this.noJumpTimer.pause();
		
		if (ig.game.flashingMessage){
			ig.game.flashingMessageTimer.pause();
			ig.game.flashingMessageIntravelTimer.pause();
		}
	},
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		//Timers
		this.girderTouchTimer = new ig.Timer(0);
		this.sinkBlockTouchTimer = new ig.Timer(0);
		this.invincibleTimer = new ig.Timer(2);
		this.nearLadderTimer = new ig.Timer(0);
		this.holdGirderTimer = new ig.Timer(0);
		this.holdingSinkBlockTimer = new ig.Timer(0);
		this.gettingOffLadderTimer = new ig.Timer(0);
		this.victoryTimer = new ig.Timer(0);
		this.deathTimer = new ig.Timer(0);
		this.attackTimer = new ig.Timer(0);
		this.spikeTimer = new ig.Timer(0);
		this.waitToStartTimer = new ig.Timer(.25);
		this.reclimbTimer = new ig.Timer(0);
		this.ceilingModeTimer = new ig.Timer(0);
		this.wallBounceTimer = new ig.Timer(0);
		this.onSpringTimer = new ig.Timer(0);
		this.onSpikesTimer = new ig.Timer(0);
		this.iceTimer = new ig.Timer(0);
		this.activateCeilingModeTimer = new ig.Timer(0);
		this.noJumpTimer = new ig.Timer(0);
		
		//Anims
		this.anims.idle = new ig.Animation( this.animSheets.player, 1, [0] );
		this.anims.run = new ig.Animation( this.animSheets.player, 0.1, [1,2,3,4,5,6] );
		this.anims.attack = new ig.Animation( this.animSheets.playerFight, 0.1, [0,1,2] );
		this.anims.airAttack = new ig.Animation( this.animSheets.playerFight, 0.1, [3,4,5] );
		this.anims.climb = new  ig.Animation( this.animSheets.playerClimb, 0.1, [0,1,2,3,4] );
		this.anims.climbSlow = new  ig.Animation( this.animSheets.playerClimb, 0.25, [0,1,2,3,4] );
		this.anims.climbLadder = new  ig.Animation( this.animSheets.playerClimb, 0.1, [7,8,9,6] );
		this.anims.climbLadderIdle = new  ig.Animation( this.animSheets.playerClimb, 0.1, [6] );
		this.anims.getOffLadder = new  ig.Animation( this.animSheets.playerClimb, 0.1, [10] );
		this.anims.climbIdle = new  ig.Animation( this.animSheets.playerClimb, 1, [0] );
		this.anims.hang = new  ig.Animation( this.animSheets.playerClimb, 1, [5] );
		this.anims.jump = new ig.Animation( this.animSheets.player, 1, [8] );
		this.anims.fall = new ig.Animation( this.animSheets.player, 1, [9] );
		this.anims.win = new ig.Animation( this.animSheets.player, .5, [10,11], true );
		this.anims.dying = new ig.Animation( this.animSheets.playerDeath, 1, [0], true);

		this.anims.idleInv = new ig.Animation( this.animSheets.player, 0.05, [0, 0, 7] );
		this.anims.runInv = new ig.Animation( this.animSheets.player, 0.05, [1,2,7,3,4,7,5,6,7] );
		this.anims.jumpInv = new ig.Animation( this.animSheets.player, 0.05, [8,8,7] );
		this.anims.fallInv = new ig.Animation( this.animSheets.player, 0.05, [9,9,7] );

		this.currentAnim = this.anims.fall;
		
		//Make sure mute button exists
		if (!ig.global.wm){
			ig.game.spawnButtons();
		}
		//Make wall jumps easier on mobile devices.
		if( ig.ua.mobile ) {
			this.easyJumps = true;	
		}
	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.invincibleTimer.set(2);
		this.dying = false;
		this.dead = false;
		this.pause = false;
		this.victoryDance = false;
		this.landed = false;
		this.deathMode = null;
		this.currentAnim = this.anims.fall;
		//Reset this variable so enemy deaths count towards metrics
		ig.game.clearingLevel = false;
		
		//Calculate Token Stuff and Make sure mute button exists
		if (!ig.global.wm){
			ig.game.spawnButtons();
		}
		//Make wall jumps easier on mobile devices.
		if( ig.ua.mobile ) {
			this.easyJumps = true;	
		}
	},
	playLadderNoise: function(){
		if (!this.ladderSoundLooping){
			this.ladderSoundLooping = true;	
			if (!ig.game.muteGame){
				this.ladderSound.loop = true;
				this.ladderSound.volume = .02; 
				this.ladderSound.play();
				}
		}	
	},
	stopLadderNoise: function(){
		this.ladderSoundLooping = false;
		this.ladderSound.stop();
	},
	paused: function(){
		//Pause Movement
		
		this.storeVel.x = this.vel.x ? this.vel.x : 0; 	
		this.storeVel.y = this.vel.y ? this.vel.y : 0;	
		this.vel.x = 0;
		this.vel.y = 0;
		this.maxVelStore.x = this.maxVel.x;
		this.maxVelStore.y = this.maxVel.y;
		this.maxVel.x = 0;
		this.maxVel.y = 0;
		this.theGravityFactor = this.gravityFactor;
		this.gravityFactor = 0;
		//Pause Animation
		if (this.currentAnim){
			this.storeAnim = this.currentAnim;
		}
		this.pauseFrame =  this.currentAnim ? this.currentAnim.frame : 0;
		this.pause = true;
		//Pause Timers
		this.pauseTimers();
		ig.game.pause = true;
	},
	unpaused: function(){
		//Restore Movement
		this.maxVel.x = this.maxVelStore.x;
		this.maxVel.y = this.maxVelStore.y;
		this.vel.x = this.storeVel.x;
		this.vel.y = this.storeVel.y;
		this.storeAnim = null,
		 this.gravityFactor = this.theGravityFactor;
		//Restore Timers
		this.unpauseTimers();
		//Restore Switches
		this.pause = false;
	},
	invincible: function(time){
		this.invin = true;
		this.invincibleTimer.set(time);
	},
	movements: function(){
		// move left or right
		var accelAir = this.accelAir;	
		var accel = this.accelGround;
		this.amReady = true;
		this.gravityFactor = 1;
		
		//Activate Ladder mode
		if (this.nearLadderTimer.delta() < 0 && ig.input.pressed('jump') && !this.ladderMode && !this.gettingOffTheLadder && !this.attacking || this.nearLadderTimer.delta() < 0 && ig.input.state('jump') && !this.ladderMode  && !this.gettingOffTheLadder && !this.attacking ){
			this.ladderMode = true;
			//Set position on ladder
			this.setLadderPos();
		}
		
		//Respond to Girders
		if (this.touchingGirder){
			if (this.girderLocation == "under" && this.vel.y == 0 && this.jumpCount != 0 && !this.ceilingMode  || this.standing && this.jumpCount != 0 ){
				this.jumpCount = 0;
			}
			if (this.girderLocation == "over" && ig.input.state('jump') && !this.holdingGirder && this.holdGirderTimer.delta() > 0 ){
				this.holdingGirder = true;
				this.activateCeilingMode();	
			}
		}
		//Respond to Sinkblock
		if (this.touchingSinkBlock){
			if (this.sinkBlockLocation == "under" && this.vel.y == 0 && this.jumpCount != 0 && !this.ceilingMode || this.standing && this.jumpCount != 0 ){
				this.jumpCount = 0;
			}
			if (this.sinkBlockLocation == "over" && ig.input.state('jump') && !this.holdingSinkBlock && this.holdingSinkBlockTimer.delta() > 0 ){
				this.holdingSinkBlock = true;
				this.activateCeilingMode();	
			}
		}
		
		//Add things that make me "not ready" - (Pause player while the rest of the game moves)
		if (this.dying || this.dead || this.victoryDance || ig.game.transition || ig.game.deathScreen){
			this.amReady = false;	
			this.vel.x = 0;
			this.accel.x = 0;		
		}
		else if (this.gettingOffTheLadder){
			this.vel.x = 0;
			this.vel.y = 0;
			if (this.pos.y + this.size.y > this.ladderTarget){
				this.pos.y = this.ladderTarget - this.size.y;
			}
			if (ig.input.pressed('action')){
				this.attackNow();
			}		
		}
		else if (this.ladderMode){
			this.vel.x = 0;
			this.accel.x = 0;
			this.vel.y = 0;
			this.gravityFactor = 0;
			if (ig.input.pressed('jump') || ig.input.pressed('down') ){
				this.anims.climbLadder.rewind();			
			}
			if (ig.input.state('jump')){
				this.vel.y = -100;	
				this.playLadderNoise();
			}
			if (ig.input.state('down')){
				this.vel.y = 100;	
				this.playLadderNoise();
			}
			this.ladderModeCheck();
			//Player is attacking while climbing the ladder
			if (ig.input.pressed('action')){
				this.ladderMode = false;
				this.attackNow();
			}		
		}
		else if (!this.attacking && ig.input.pressed('action')){
			//Attack
			this.attackNow();
			
			if (this.wallBounceMode){
			}
			else if (this.wallMode){
				this.clearWallMode('attack');
			}
			else if (this.ceilingMode){
				this.clearCeilingMode('attack');
			}
		}
		else if (this.wallBounceMode){
			//Make it really easy to do cool jumps on a phone
			if (this.easyJumps){
				if (this.wallBounceDirection == "left"){
					this.vel.x = -500;
					this.flip = true;
					this.vel.y = -this.jump/2;	
				}
				else{
					this.vel.x = 500;
					this.flip = false;
					this.vel.y = -this.jump/2;		
				}
			}
			//Left
			else if (this.wallBounceDirection == "left"){
				if (ig.input.state('left')){
					this.vel.x = -500;
					this.flip = true;
					this.vel.y = -this.jump/1.7;	
				}
				else if (ig.input.state('right')){
					this.vel.x = -350;
					this.flip = false;
					this.vel.y = -this.jump/4;	
				}
				else{
					this.vel.x = -400;
					this.vel.y = -this.jump/3;	
				}
			}
			//Right
			else{
				if (ig.input.state('left')){
					this.vel.x = 350;
					this.flip = true;
					this.vel.y = -this.jump/4;	
				}
				else if (ig.input.state('right')){
					this.vel.x = 500;
					this.flip = false;
					this.vel.y = -this.jump/1.7;	
				}
				else{
					this.vel.x = 400;
					this.vel.y = -this.jump/3;
				}
			}
			
		}
		else if (this.wallMode){
			this.vel.x = 0;
			this.gravityFactor = 0;
			if (this.holdingWall == "left"){
				if (ig.input.pressed('right') || ig.input.pressed('jump') || this.easyJumps && ig.input.released('left')){
					this.bounceOffWall('right');
				}
				else if (ig.input.released('left') || !this.cT1 && !this.touchingSinkBlock ){
					this.clearWallMode('letGo');
				}
			}
			if (this.holdingWall == "right" ){
				if (ig.input.pressed('left') || ig.input.pressed('jump') || this.easyJumps && ig.input.released('right') ){
					this.bounceOffWall('left');
				}
				else if (ig.input.released('right') || !this.cT3  && !this.touchingSinkBlock  ){
					this.clearWallMode('letGo');
				}
			}
			if (!this.anchorX ){
				this.anchorX = this.pos.x;
			}
			if (this.anchorX != this.pos.x && !this.touchingSinkBlock){
				this.clearWallMode('letGo 3');
			}			
		}
		else if (this.ceilingMode){
			
			this.gravityFactor = 0;
			this.vel.y = -100;	
			//this.accel.y = 0;	
			if (ig.input.state('jump') && this.ceilingModeTimer.delta() <= .06 ){
				this.ceilingModeTimer.set(.06);
			}
			if (ig.input.pressed('left') || ig.input.pressed('right')){
				this.anims.climbSlow.rewind();												 
			}
			if (ig.input.state('left')){
				this.accel.x = -100;
				if (this.vel.x < -50){
					this.vel.x = -50;
				}
				this.flip = true;
			}
			else if (ig.input.state('right')){
				this.accel.x = 100;
				if (this.vel.x > 50){
					this.vel.x = 50;
				}
				this.flip = false;
			}
			if  (ig.input.released('left') || ig.input.released('right')){
				this.accel.x = 0;	
				this.vel.x = 0;	
			}
			if (this.holdingSinkBlock){
				this.gravityFactor = 0;
				if (this.sinkBlockVelY){
					var sinkBlockN = null;
					if (ig.game.getEntityByName(this.girderName)){
						sinkBlockN = ig.game.getEntityByName(this.sinkBlockName);
						this.vel.y = sinkBlockN.vel.y - 100;
					}
				}
				//Allow for movement
				if (ig.input.pressed('left') || ig.input.pressed('right') ){
					this.anims.climb.rewind();	
				}
				if (ig.input.state('left')){
					this.vel.x  -= 45;
				}
				else if (ig.input.state('right')){
					this.vel.x  += 45;
				}
				//Drop mode if im floating away
				if (!this.girderLevelY){
					this.girderLevelY = this.pos.y;
				}
				if (this.pos.y != this.girderLevelY && this.touchingGirderDir != "y" && !this.touchingSinkBlock){
					this.clearCeilingMode('floating away');
				}
			}
			if (this.holdingGirder){
				this.gravityFactor = 0;
				this.friction.x = 0;
				//Set my velocity to girder
				if (this.girderVelX){
					var gSpeed = this.girderVelX;
					if (this.girderDir == "left" && gSpeed > 0 || this.girderDir == "right" && gSpeed < 0 ){
						gSpeed *=-1;	
					}
					this.vel.x = gSpeed;
				}
				else if (this.touchingGirderDir  == "x"){
					if (!ig.input.state('left') && !ig.input.state('right')){
						this.vel.x = 0;
					}
				}
				if (this.girderVelY){
					var girderN = null;
					if (ig.game.getEntityByName(this.girderName)){
						girderN = ig.game.getEntityByName(this.girderName);
						this.vel.y = girderN.vel.y - 100;
					}
				}
				
				//Allow for movement
				if (ig.input.pressed('left') || ig.input.pressed('right') ){
					this.anims.climb.rewind();	
				}
				if (ig.input.state('left')){
					if (this.touchingGirderDir  == "x"){
						//Girder is going to the right and player goes left
						if (this.girderVelX > 0){
							this.vel.x  -=  this.girderVelX + 30;
						}
						//Girder is going left and player goes left
						else{
							this.vel.x  -= 45;
						}
					}
					else if (this.touchingGirderDir  == "y"){
						this.vel.x  -= 30;
					}
				}
				else if (ig.input.state('right')){
					if (this.touchingGirderDir  == "x"){
						//Girder is going left and player is going right
						if (this.girderVelX < 0){
							this.vel.x  -=  this.girderVelX - 30;
						}
						//Girder is going right and player is going right
						else{
							this.vel.x  += 45;
						}
					}
					else if (this.touchingGirderDir  == "y"){
						this.vel.x  += 30;
					}
				}
				//Drop mode if im floating away
				if (!this.girderLevelY){
					this.girderLevelY = this.pos.y;
				}
				if (this.pos.y != this.girderLevelY && this.touchingGirderDir != "y"){
					this.clearCeilingMode('floating away');
				}
				
				
			}
		}
		//On Spring
		else if (this.onSpring){
			var jumpFactor = .8;
			this.jumpCount = 1;
			this.vel.y = -this.jump * jumpFactor;
			if( ig.input.state('left')) {
				this.accel.x = -accel * jumpFactor;
				this.flip = true;
			}
			else if( ig.input.state('right') ) {
				this.accel.x = accel * jumpFactor;
				this.flip = false;
			}
		}
		else if (ig.input.pressed('jump') && this.jumpCount < this.maxJumps && this.noJump != true){
			this.vel.y = -this.jump;
			this.jumpCount++;
			if (this.touchingSinkBlock && !this.holdingSinkBlock){
				this.touchingSinkBlock = false;	
			}
			ig.game.jumpNoise();
		}
		else if (ig.input.state('left') && ig.input.state('right')){
			this.accel.x = 0;									
		}
		else if( ig.input.state('left')) {
			if (this.vel.x > 0){
				this.accel.x = 0;	
				this.vel.x = 0;
			}
			this.accel.x = -accel;
			this.flip = true;
		}
		else if( ig.input.state('right') ) {
			if (this.vel.x < 0){
				this.accel.x = 0;
				this.vel.x = 0;
			}
			this.accel.x = accel;
			this.flip = false;
		}
		else {
			this.accel.x = 0;
		}
		//Stop movement based sounds
		if (this.ladderSoundLooping && !ig.input.state('jump') ){
			this.ladderSoundLooping = false;	
			this.ladderSound.stop();
		}
		
	},
	setLadderPos: function(){
		if (this.pos.x < this.ladderX){
			this.pos.x = this.ladderX + 9;	
		}
		else if (this.pos.x + this.size.x  > this.ladderX + 32){
			this.pos.x = this.ladderX + 23 - this.size.x;	
		}
	},
	ladderModeCheck: function(){
		if (this.pos.y + (this.size.y / 2) < this.ladderTarget){
			this.ladderMode = false;
			this.gettingOffTheLadder = true;
			this.gettingOffLadderTimer.set(.1);
		}
		else if ( ig.input.state('down') && this.cT8 ){
			this.ladderMode = false;
		}
		if (this.ladderMode && this.nearLadderTimer.delta() > 0){
			this.ladderMode = false;
		}
	},
	attackNow: function(){
		if (this.attackTimer.delta() > this.attackLimit){
			this.attacking = true;
			this.attackTimer.set(.3);
			
			this.anims.attack.rewind();
			this.anims.airAttack.rewind();
		}
	},
	setOffset: function(){
		//Attacking to the left
		if (this.attacking && this.flip){
			this.offset.x = 19;
			this.offset.y = 15;
		}
		//Attacking to the right
		else if (this.attacking){
			this.offset.x = 25;
			this.offset.y = 15;
		}
		//Facing the left
		else if (this.flip){
			this.offset.x = 9;
			this.offset.y = 7;

		}
		//Facing the right
		else{
			this.offset.x = 12;
			this.offset.y = 7;
		}
	},
	animMe: function(){
		//Set Animation
		if (this.dying){
			this.currentAnim = this.anims.dying;
		}
		else if (this.victoryDance && this.vel.y ==0){
			this.currentAnim = this.anims.win;	
		}
		//Stay on a cool frame when the level loads, before the player first hits the ground.
		else if (!this.landed){
			this.currentAnim = this.anims.fall;
		}
		else if (this.pause){
			if (this.storeAnim ){
				this.currentAnim = this.storeAnim;
				this.currentAnim.gotoFrame(this.pauseFrame);
			}
			else if (this.currentAnim){
				this.currentAnim.gotoFrame(this.pauseFrame);
			}
		}
		else if (this.gettingOffTheLadder){
			this.currentAnim = this.anims.getOffLadder; 
		}
		else if (this.ladderMode){
			if (this.vel.y != 0){
				this.currentAnim = this.anims.climbLadder; 	
			}
			else{
				this.currentAnim = this.anims.climbLadderIdle; 	
			}	
		}
		else if (this.attacking){
			//In the air
			if (this.vel.y != 0){
				this.currentAnim = this.anims.airAttack; 	
			}
			else{
				this.currentAnim = this.anims.attack; 	
			}
		}
		else if (this.wallMode){
			this.currentAnim = this.anims.hang; 	
		}
		else if (this.ceilingMode && this.holdingGirder || this.ceilingMode && this.holdingSinkBlock){
			if (ig.input.state('left') || ig.input.state('right')){
				this.currentAnim = this.anims.climb
			}
			else{
				this.currentAnim = this.anims.climbIdle	;	
			}
		}
		else if (this.ceilingMode && this.vel.x != 0){
			var speed = this.vel.x > 0 ? this.vel.x : this.vel.x * -1; 
			if (speed > 20){
				if (this.currentAnim == this.anims.climbSlow){
					//Save current frame if switching anim from climb
					var goToThisFrame = this.currentAnim.frame;
					//change to new anim
					this.currentAnim = this.anims.climb;
					//Goto the same frame
					this.currentAnim.gotoFrame(goToThisFrame);
				}
				else{
					this.currentAnim = this.anims.climb;
				}
			}
			else{
				this.currentAnim = this.anims.climbSlow;	
			}
		}
		else if (this.ceilingMode){
			this.currentAnim = this.anims.climbIdle	;
		}
		else if (this.touchingGirder && this.touchingGirderDir == "y"){
			 if( this.vel.y < this.girderVelY && ig.input.state('jump')) {
				this.currentAnim = this.anims.jump;
			}
			else if( this.vel.x != 0 ) {
				this.currentAnim = this.anims.run;
			}
			else {
				this.currentAnim = this.anims.idle;
				this.anims.run.rewind();
			}
		}
		else if (this.touchingSinkBlock && this.sinkBlockLocation == "under"	){
			 if( this.vel.y <= this.sinkBlockVelY && ig.input.state('jump')) {
				this.currentAnim = this.anims.jump;
			}
			else if( this.vel.x != 0 ) {
				this.currentAnim = this.anims.run;
			}
			else {
				this.currentAnim = this.anims.idle;
				this.anims.run.rewind();
			}
		}
		else if (this.invin && this.vel.y < 0){
			this.currentAnim = this.anims.jumpInv;
		}
		else if( this.vel.y < 0 ) {
			this.currentAnim = this.anims.jump;
		}
		else if(this.invin && this.vel.y > 0 ) {
			this.currentAnim = this.anims.fallInv;
		}
		else if( this.vel.y > 0 ) {
			this.currentAnim = this.anims.fall;
		}
		else if( this.invin && this.vel.x != 0 ) {
			this.currentAnim = this.anims.runInv;
		}
		else if( this.vel.x != 0 && !this.onIce ) {
			this.currentAnim = this.anims.run;
		}
		else if( this.onIce && ig.input.state('left') || this.onIce && ig.input.state('right') || this.onIce && ig.input.pressed('left')|| this.onIce && ig.input.pressed('right')) {
			this.currentAnim = this.anims.run;
		}
		else if( this.invin){
			this.currentAnim = this.anims.idleInv;
			this.anims.run.rewind();	
		}
		else {
			this.currentAnim = this.anims.idle;
			this.anims.run.rewind();
		}
		if (this.currentAnim){
			this.currentAnim.flip.x = this.flip;
		}
	},
	checkConditions: function(){
		//Victory (start cut)
		if (this.victoryDance && this.victoryTimer.delta() > 0){
			if (ig.game.gameWon && !ig.game.transition){
				ig.game.endingScreen = true;
				//I kind of want to jump to the transition so I'm doing this odd delay.
				ig.game.fadeOut(-.93, ig.game.color1);				
			}
			else if (!ig.game.transition && !ig.game.gameWon){ 
				//FADEOUT
				//ig.game.fadeOut();
				ig.game.levelCleared = true;
				ig.game.slideRightIn("","",3);
			}
		}
		//Load Level and Kill Everything
		if (this.victoryDance && ig.game.readyToLoad){
			ig.game.pData.lvl++;
			//Set this variable so enemy killcount doesn't get crazy high every reload
			ig.game.clearingLevel = true;
			ig.game.saveGame();
			ig.game.LoadLevelBro( ig.game.pData.lvl );
			
		}
		if (this.dying && this.deathTimer.delta() > 0 && !this.dead){
			this.dead = true;
			ig.game.playerDead = true;
			//Stop Current Track if Playing
			ig.game.songs.l1.stop();
			ig.game.songs.l2.stop();
			ig.game.songs.l3.stop();
			ig.game.fadeOut(0, ig.game.colorWrong);	
		}
		//initiate dying sequence when health drops below 0
		if (this.health <= 0 && !this.dying){
			//Fade out to red or colorwrong
			this.initDeathSeq("fallThrough");
		}
		
		var maxX = ig.game.collisionMap.width * ig.game.collisionMap.tilesize;
		var maxY = ig.game.collisionMap.height * ig.game.collisionMap.tilesize;
		//Kill me if I fall out of collision area for some buggy reason.
		if (this.pos.y < 0 && !this.dying|| this.pos.x < 0 && !this.dying || this.pos.y > maxY && !this.dying || this.pos.x > maxX && !this.dying){
			this.initDeathSeq();
		}
		//Release the girder if holding one
		if (this.holdingGirder && ig.input.released('jump')){
			this.clearCeilingMode('let go by released jump');
		}
		//End wall bounce if I grab a girder or sinkblock
		if (this.wallBounceMode && this.holdingGirder ||  this.wallBounceMode && this.holdingSinkBlock ){
			this.wallBounceMode = false;	
		}
		//Springs
		if (this.onSpring && this.onSpringTimer.delta() > 0){
			this.onSpring = false;	
			ig.game.springSound = false;
		}
		//Ice
		if (this.onIce && this.iceTimer.delta() > 0 || this.onIce && this.vel.y != 0 && this.iceTimer.delta() > -.08){
			this.endOnIce('timer ran out');
		}
		//Lower friction if on ice
		if (this.onIce){
			this.friction.x = 600;		
		}
		//Allow the player to climb the wall again after a brief period
		if (!this.readyToClimb && this.reclimbTimer.delta() > 0){
			this.readyToClimb = true;	
		}
		//Wall Bounce Reset
		if (this.wallBounceMode && this.wallBounceTimer.delta() > 0){
			this.wallBounceMode = false;	
		}
		//Clear Girder Touch
		if (this.touchingGirder && this.girderTouchTimer.delta() >= 0){
			this.touchingGirder = false;
			this.touchingGirderDir = null;
			//Tried this to prevent air jumping off girders - may have undesirable effects
			//this.jumpCount++;
			if (this.holdingGirder){
				this.clearCeilingMode('not touching girder');
			}
		}
		//Clear Sinkblock Touch
		if (this.touchingSinkBlock && this.sinkBlockTouchTimer.delta() >= 0){
			this.touchingSinkBlock = false;
			//this.jumpCount++;
			if (this.holdingSinkBlock){
				this.clearCeilingMode('not touching sink block');
			}
		}
		//Spikes
		if (ig.game.playerOnSpikes && this.onSpikesTimer.delta() > .05){
			ig.game.playerOnSpikes = false;	
		}
		//Spawn Attack
		if (this.attacking && !this.spawnAttack){
			if (this.flip){
				//Left
				ig.game.spawnEntity( EntityPickaxe, this.pos.x - this.size.x, this.pos.y - (this.size.y/2));	
			}
			else{
				//Right
				ig.game.spawnEntity( EntityPickaxe, this.pos.x + this.size.x, this.pos.y - (this.size.y/2));	
			}
			
			ig.game.pickAxeSwingNoise();
			
			
			this.spawnAttack = true;
		}
		//End attack
		if (this.attacking && this.attackTimer.delta() > 0){
			this.attacking = false;
			this.spawnAttack = false;
		}
		
		//End invinc
		if (this.invin && this.invincibleTimer.delta() > 0){
			this.invin = false;	
		}

		//End Flashing Messages
		if (ig.game.flashingMessage && ig.game.flashingMessageTimer.delta() > 0){
			ig.game.flashingMessage = false;
		}
		
		//Handles Ceiling Mode
		if (this.ceilingMode && this.ceilingModeTimer.delta() > 0){
			this.clearCeilingMode('ceilng mode timed out');
		}
		
		//Get off the ladder
		if (this.gettingOffTheLadder && this.gettingOffLadderTimer.delta() > 0){
			this.gettingOffTheLadder = false;	
		}
		//Stop ladder noise
		if (this.ladderSoundLooping && ig.game.pause){
			this.stopLadderNoise();
		}
		//End No Jump
		if (this.noJump && this.noJumpTimer.delta() > 0){
			this.noJump = false;
		}
	},
	endOnIce: function(why){
		this.friction.x = this.frictionStore	;
		this.onIce = false;	
		if ( !ig.input.state('left') &&  !ig.input.state('right')){
			this.vel.x = 0;
		}
	},
	update: function() {
		
		if (!this.musicPlaying && !ig.game.cutScreen && !ig.game.titleScreen && !ig.game.fadeToRed && !ig.game.endingScreen){
			//this.playMusicBro();
			this.musicPlaying = true;
		}
		if ( ig.game.pause && !this.pause  ){
			this.readyBro = false;
			this.paused();
		}
		else if (this.pause && !ig.game.pause){
			this.readyBro = true;
			this.unpaused();
		}
	
		//Move if the Player is "Ready"
		if (this.readyBro){
			if (this.onSpring){
				this.maxVel.y = this.maxVelStore.y * 3;
			}
			else{
				this.maxVel.y = this.maxVelStore.y;
			}
			this.checkForWallsAndCeiling();
			this.movements();
		}
		
		//Dying
		else if (this.dying){
			//Death stuff
			this.vel.x = 0;	
			this.accel.x = 0;
			this.maxVel.y =  this.jump;
			this.vel.y = this.jump;
			this.collides = ig.Entity.COLLIDES.NEVER;
			this.type = ig.Entity.TYPE.NONE;
			if (this.deathMode == "fallThrough"){
					
			}
		}

		
		//Set Animation
		this.checkConditions();
		this.setOffset();
		this.animMe();
		
		
		this.parent();
	},
	receiveDamage( amount, from ){
		if (!this.invin){
			this.health -=amount;
			//console.log('took ' + amount + ' damage from ' + from + ' my health is now ' + this.health);
			if (this.health > 0){
				this.invincible(3);
			}
		}
		
	},
	bounceOffWall: function(dir){
		if ( !this.wallBounceMode ){
			this.wallBounceMode = true;
			this.wallBounceDirection = dir;
			if (this.easyJumps){
				this.wallBounceTimer.set(.2);
			}
			else{
				this.wallBounceTimer.set(.15);
			}
			this.clearWallMode('bounce');
			this.jumpCount = 1;
			
			ig.game.wallJumpNoise();
		}
	},
	initDeathSeq: function(deathMode){
		if (deathMode){
			this.deathMode = deathMode;
		}
		if (deathMode == "fallThrough"){
			this.collides = ig.Entity.COLLIDES.NEVER;	
		}
		this.deathAnim = true;
		this.anims.dying.rewind();
		this.dying = true;
		ig.game.dying = true;
		this.deathTimer.set(2);
		
		//Make a wrong sound
		if (!ig.game.muteGame){	ig.game.deadSound.volume = .5; ig.game.deadSound.play();  ig.game.deathNoise();}

	},
	kill: function(){
		this.parent();
	},
	checkForWallsAndCeiling: function(){
		this.clearCheckTileValues();
		this.checkTiles();
		if (this.ceilingMode && !this.cT1 && !this.cT2 && !this.cT3 && !this.holdingGirder  && !this.holdingSinkBlock){
			this.clearCeilingMode('tiles are not there');
		}
	},
	didGirderKillMe: function(){
		//Kill me if a girder crushes me
	},
	clearCheckTileValues: function(){
		this.cT1 = null;
		this.cT2 = null;
		this.cT3 = null;
		this.cT4 = null;
		this.cT5 = null;
		this.cT6 = null;
		this.cT7 = null;
		this.cT8 = null;
		//this.cT3 = null;

	},
	clearCeilingMode: function(where){
		if (this.holdingGirder || this.holdingSinkBlock){
			this.holdingGirder = false;
			this.holdingSinkBlock = false;
			this.friction.x = this.frictionStore;
			this.girderVelX = null;
			this.girderVelY = null;
			this.girderLevelY = null;
			this.girderTouchTimer.set(0);
			this.sinkBlockTouchTimer.set(0);
			this.sinkBlockVelY = null;
			this.sinkBlockLocation = null;
			this.holdGirderTimer.set(.1);
			this.holdingSinkBlockTimer.set(.1);
		}
		this.jumpCount++;
		this.ceilingMode = false;
	},
	clearWallMode: function(how){
		if (how == "attack"){
			this.readyToClimb = false;
			this.wallMode = false;
			this.reclimbTimer.set(.4);
		}
		else{
			this.readyToClimb = false;
			this.wallMode = false;
			this.reclimbTimer.set(.15);
		}
	},
	checkTiles: function(){
		//Tile Margins
		var tMX = 7;
		var tMY = 7;
		var clMar = 1;
		//Tile 1
		if (!ig.game.collisionMap.getTile(this.pos.x - tMX, this.pos.y - tMY)){
			this.cT1 = false;
		}
		else{
			this.cT1 = true;
		}
		//Tile 2
		if (!ig.game.collisionMap.getTile(this.pos.x + this.size.x / 2, this.pos.y - tMY)){
			this.cT2 = false;
		}
		else{
			this.cT2 = true;	
		}
		//Tile 3
		if (!ig.game.collisionMap.getTile(this.pos.x + this.size.x + tMX, this.pos.y - tMY)){
			this.cT3 = false;
		}
		else{
			this.cT3 = true;	
		}
		//Tile 4
		if (!ig.game.collisionMap.getTile(this.pos.x - tMX, this.pos.y + this.size.y / 2)){
			this.cT4 = false;
		}
		else{
			this.cT4 = true;	
		}
		//Tile 5
		if (!ig.game.collisionMap.getTile(this.pos.x + this.size.x + tMX, this.pos.y + this.size.y / 2)){
			this.cT5 = false;
		}
		else{
			this.cT5 = true;	
		}
		//Tile 6
		if (!ig.game.collisionMap.getTile(this.pos.x - tMX, this.pos.y + this.size.y + tMY)){
			this.cT6 = false;
		}
		else{
			this.cT6 = true;
		}
		//Tile 7
		if (!ig.game.collisionMap.getTile(this.pos.x + this.size.x / 2, this.pos.y + this.size.y + tMY)){
			this.cT7 = false;
		}
		else{
			this.cT7 = true;
		}
		//Tile 8
		if (!ig.game.collisionMap.getTile(this.pos.x + this.size.x + tMX, this.pos.y + this.size.y + tMY)){
			this.cT8 = false;
		}
		else{
			this.cT8 = true;
		}
		
	},
	activateWallMode: function(dir){
		//console.log('wall mode activated ' + dir);
		
		//Going left
		if (dir < 0){
			this.holdingWall = "left";
			this.flip = true;
		}
		else{
			this.holdingWall = "right";
			this.flip = false;
			//going right	
		}
		if (this.holdingWall  == "left" && ig.input.state('left') && this.cT1 ||  this.holdingWall  == "right" && ig.input.state('right') && this.cT3 || this.holdingWall  == "left" && ig.input.state('left') && this.touchingSinkBlock && !this.wallMode  || this.holdingWall  == "right" && ig.input.state('right') && this.touchingSinkBlock && !this.wallMode){
			this.wallMode = true;
			this.anchorX = null;
			this.vel.y = 0;
			this.accel.y = 0;
			ig.game.wallGrabNoise();
		}
	},
	activateCeilingMode: function(){
		this.ceilingMode = true;
		this.vel.x = 0;
		this.accel.x = 0;
		this.ceilingModeTimer.set(.1);
		this.ceilingModeCount = 0;
		ig.game.wallGrabNoise();
	},
	reverseSinkblock: function(){
		var moveSBAmount = 32;	
		var sbN = ig.game.getEntityByName(this.sinkBlockName);
		sbN.pos.y -= moveSBAmount;	
		sbN.dropping = false;
		sbN.rising = true;
		sbN.squashed('up');
	},
	reverseGirder: function(){
		
		var moveGirAmount = 25;
		
		if (this.touchingGirder && this.touchingGirderDir == "y" && this.girderLocation == "under"){
			if (ig.game.getEntityByName(this.girderName)){
				var girderN = ig.game.getEntityByName(this.girderName);
				if (!ig.game.collisionMap.getTile(girderN.pos.x + (girderN.size.x / 2), girderN.pos.y + girderN.size.y + moveGirAmount)){
					girderN.squashed('up');
					girderN.pos.y += moveGirAmount;	
				}
			}
		}
		if (this.touchingGirder && this.touchingGirderDir == "y" && this.girderLocation == "over" || this.ceilingMode && this.cT7 || ig.game.girderReverseUp){
			if (ig.game.getEntityByName(this.girderName)){
				var girderN = ig.game.getEntityByName(this.girderName);
				girderN.squashed('down');
				girderN.pos.y -= moveGirAmount;	
			}
		}
	},
	handleMovementTrace: function( res ) {
		if (this.deathMode == "fallThrough" && this.dying){
			//float through walls
			this.pos.x += this.vel.x * ig.system.tick;
			this.pos.y += this.vel.y * ig.system.tick;	
		}
		else{
			if (this.ceilingMode && this.cT7 && this.touchingGirderDir == "y" && !ig.game.quiz && !this.invin ){
				ig.game.girderCrush = true;
				ig.game.quizbox.quiz(99999, "girder crushing down");
				ig.game.girderReverseUp = true;
				ig.game.girderCrushNoise();
			}
			else if (this.ceilingMode && this.cT7 && this.touchingSinkBlock && !ig.game.quiz && !this.invin ){
				ig.game.sinkBlockCrush = true;
				ig.game.quizbox.quiz(99999, "sinkBlockCrush crushing down");
				sinkBlockN = ig.game.getEntityByName(this.sinkBlockName);
				ig.game.girderCrushNoise();
			}
			var accel = this.standing ? this.accelGround : this.accelAir;
			
			if( res.collision.y || res.collision.slope ){
				if (this.inTheAir){
					ig.game.landNoise();
				}
				this.inTheAir = false;
			}
			else if( !res.collision.y && !res.collision.slope ){
				this.inTheAir = true;
			}	
			
				
			
			if( res.collision.y || res.collision.slope ){
				
				this.vel.y = 0;
				//I am on a platform and I am getting crushed from the bottom up
				if ( this.touchingGirder && this.touchingGirderDir == "y" && this.girderTouchTimer.delta() > -.04 && this.girderLocation == "under" ){
					if (ig.game.getEntityByName(this.girderName)){
						girderN = ig.game.getEntityByName(this.girderName);
						if (girderN.pos.y + girderN.size.y >= this.pos.y + (this.size.y /2) && girderN.vel.y < 0 && !ig.game.quiz && !this.invin){
							ig.game.girderCrush = true;
							ig.game.quizbox.quiz(99999, 'getting crushed by a girder from the bottom');
							ig.game.girderCrushNoise();
						}
					}
				}
				//I am on the ground and getting crushed by a platform
				if (res.pos.y == this.pos.y && this.touchingGirder && this.touchingGirderDir == "y"){
					var girderN = null;
					if (ig.game.getEntityByName(this.girderName)){
						girderN = ig.game.getEntityByName(this.girderName);
						if (girderN.pos.y + girderN.size.y <= this.pos.y + (this.size.y /2) && girderN.vel.y > 0 && !ig.game.quiz && !this.invin){
							ig.game.girderCrush = true;
							ig.game.quizbox.quiz(99999, 'getting crushed by a girder from above');	
							ig.game.girderCrushNoise();
						}
					}
					
				}
				//I am on the ground and getting crushed by a sinkBlock
				if (res.pos.y == this.pos.y + this.size.y && this.touchingSinkBlock ){
					var sinkBlockN = null;
					if (ig.game.getEntityByName(this.sinkBlockName) && !ig.game.quiz && !this.invin){
						sinkBlockN = ig.game.getEntityByName(this.sinkBlockName);
						ig.game.sinkBlockCrush = true;
						ig.game.quizbox.quiz(99999, 'getting crushed by a sinkblock from above');	
						ig.game.girderCrushNoise();
					}
					
				}
				if (res.pos.y < this.pos.y && !this.attacking && ig.input.state('jump') && this.activateCeilingModeTimer.delta() > 0 && !this.standing  || res.pos.y < this.pos.y && !this.attacking && ig.input.pressed('jump') && this.activateCeilingModeTimer.delta() > 0 && !this.standing){
					this.activateCeilingMode();
					this.activateCeilingModeTimer.set(.1);
				}
				else if (res.pos.y >= this.pos.y && !this.cT2 ){
					this.jumpCount = 0;	
				}
				if (!this.landed){
					this.landed = true;
					ig.game.sortEntitiesDeferred();
					ig.game.transition = false;
					ig.game.readyToLoad = false;
					ig.game.playMusicBro(1);
					//This prevents the player from reseting the cut animation over and over again.
					ig.game.cutCleared = false;
				}
			}
			if (res.collision.x && !this.wallMode && this.readyToClimb && !this.standing && !this.cT7 && !this.attacking && !this.holdingGirder){
				this.activateWallMode(this.vel.x);
			}
			//Continue resolving the collision as normal
			this.parent(res); 
		}
	}
});
EntityPickaxe = ig.Entity.extend({
	size: {x: 40, y: 40},
	offset: {x: 0, y: 0},
	maxVel: {x: 4000, y: 1000},
	name:"pickaxe",
	damage:1,
	bounciness: 0, 
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.BOTH, 
	collides: ig.Entity.COLLIDES.NEVER,
	
	init: function( x, y, settings ) {
		this.adjustPlayerSpeed();
		this.parent( x, y, settings );
	},
	reset: function( x, y, settings ) {
		this.adjustPlayerSpeed();
		this.parent( x, y, settings );
	},
	adjustPlayerSpeed: function(){
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			if (player.vel.y == 0){
				player.vel.x = 0;
			}
		}
	},
	update: function() {
		var player = ig.game.getEntityByName('player');
				
		if (player.flip){
			this.pos.x = player.pos.x - (this.size.x / 2) - 2;	
		}
		else{
			this.pos.x = player.pos.x - 2;		
		}
		this.pos.y = player.pos.y - (player.size.y  / 10);	
		
		//die
		if (player.attacking == false) {
			this.kill();
		}
		this.maxVel.x = player.maxVel.x;
		this.maxVel.y = player.maxVel.y;
		this.vel.x = player.vel.x;
		this.vel.y = player.vel.y;
		
		this.parent();
	},
	handleMovementTrace: function( res ) {
		this.pos.x += this.vel.x * ig.system.tick;
    	this.pos.y += this.vel.y * ig.system.tick;
	},
	
	check: function( other ) {
		//If other has a bounce timer, do the attack
		if (other.bounceTimer){ 
			if (!other.imHit){
				var player = ig.game.getEntityByName('player');
				other.receiveDamage( this.damage, 'pickaxe' );
				other.imHit = true;
				other.bounceDir = other.pos.x > (player.pos.x + player.size.x) ? 1 : -1; 
				other.bounceTimer.set(.2);
			}
			
		}//Rock
		else if (other.dropTimer){
			other.receiveDamage( this.damage, this );	
		}
		else if (other.name == "snowball"){
			if (!ig.game.quiz && !ig.game.pause && !other.kOTB){
				ig.game.pickAxeNoise();
			}
			other.receiveDamage( this.damage, this );	
		}
		//Crumble Brick
		else if (other.name == "crumblebrick"){
			if (!other.broke && !other.restoring){
				other.breakMe();	
			}
		}
		
	}
});
ig.EntityPool.enableFor( EntityPlayer );
ig.EntityPool.enableFor( EntityPickaxe );
});
