ig.module(
	'game.entities.monkey'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
	
EntityMonkey = ig.Entity.extend({
	size: {x: 34, y: 25},
	offset: {x: 0, y: 0},
	maxVel: {x: 1000, y: 1000},
	storeMaxVel: {x: 1000, y: 1000},
	storeVel: {x: null, y: null},
	friction: {x: 400, y: 0},
	
	zIndex: 1,
	gravityFactor: 1,
	
	type: ig.Entity.TYPE.B, // Evil enemy group
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	name: null,
	health: 1,
	speed: 100,
	bounceSpeed: 500,
	runWaitTime: 2.5,
	flip: false,
	idle: false,
	pause: false,
	kOTB: false,
	imHit: false,
	bounceDir: null,
	landed: false,
	jumping: false,
	onGirder: false,
	noticePlayer: false,
	playerVisible: false,
	roomToBackUp: true,
	sightDist: 250, //This is used by DIST to Player
	playerEscapeDist: 400,
	flipTimeLimit: .15,
	
	//attackSound: new ig.Sound( 'media/sounds/chihuahua.*' ),
	
	//animSheet: new ig.AnimationSheet( 'media/monkey.png', 36, 30 ),
	
	animSheets: {
		walk: new ig.AnimationSheet( 'media/monkey.png', 36, 30 ),
		jump: new ig.AnimationSheet( 'media/monkey-jumping.png', 42, 40 ),
	},
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		var randomJumpTime = 1+Math.floor(Math.random()*3);
		this.jumpTimer = new ig.Timer(randomJumpTime);
		this.idleTimer = new ig.Timer(0);
		this.idlingTimer = new ig.Timer(0);
		this.runTimer = new ig.Timer(0);
		this.attackTimer = new ig.Timer(0);
		this.dieUpTimer = new ig.Timer(0);
		this.bounceTimer = new ig.Timer(0);
		this.sightTimer = new ig.Timer(0);
		this.lastSawPlayerTimer = new ig.Timer(0);
		this.flipTimer = new ig.Timer(0);
		
		this.anims.walk = new ig.Animation( this.animSheets.walk, .1, [0,1,2,3,4,5,6,7]);
		this.anims.damaged = new ig.Animation( this.animSheets.walk, .05, [15,16,17,18]);
		this.anims.run = new ig.Animation( this.animSheets.walk, .05, [0,1,2,3,4,5,6,7] );
		this.anims.idle = new ig.Animation( this.animSheets.walk, .1, [9,10,11,12,13,14] );
		this.anims.jump = new ig.Animation( this.animSheets.jump, 1, [0] );
		this.anims.fall = new ig.Animation( this.animSheets.jump, 1, [1]);
		
		//Name me
		if( !ig.global.wm ) { 
			this.nameMe();
		}
		//this.addAnim( 'walk', .1, [0,1,2,3,4,5,6,7] );

	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.kOTB = false;
		this.nameMe();
		this.setRandomJumpTime('jump');

	},
	nameMe: function(){
		if (ig.game.pData.timesPassed > 0){
			ig.game.spawnEntity( EntityBluemonkey, this.pos.x, this.pos.y, {flip: this.flip});
			this.kill();
		}
		this.name = "monkey" + ig.game.monkeyCount;
		ig.game.monkeyCount++;
	},
	pauseTimers: function(){
		this.jumpTimer.pause();
		this.runTimer.pause();
		this.idleTimer.pause();
		this.bounceTimer.pause();
		this.flipTimer.pause();
		this.idlingTimer.pause();
		this.attackTimer.pause();
		this.dieUpTimer.pause();
		this.sightTimer.pause();
		this.lastSawPlayerTimer.pause();
	},
	unpauseTimers: function(){
		this.jumpTimer.unpause();
		this.runTimer.unpause();
		this.flipTimer.unpause();
		this.idleTimer.unpause();
		this.bounceTimer.unpause();
		this.idlingTimer.unpause();
		this.attackTimer.unpause();
		this.dieUpTimer.unpause();
		this.sightTimer.unpause();
		this.lastSawPlayerTimer.unpause();
	},
	checkJumpRoom: function(){
		//Check for collision tile
		var targetDist = this.size.x * 7;
		var targetDist2 = this.size.x * 5;
		var targetDist3 = this.size.x * 3;
		 //Here's a complex chain to determine whether I'm going to jump off a platform or not (dont jump off).
		if (ig.game.collisionMap.getTile(	this.pos.x + (this.flip ? + -targetDist : targetDist + this.size.x), this.pos.y + this.size.y+1	) && ig.game.collisionMap.getTile(	this.pos.x + (this.flip ? + -targetDist2 : targetDist2 + this.size.x), this.pos.y + this.size.y+1) && ig.game.collisionMap.getTile(	this.pos.x + (this.flip ? + -targetDist3 : targetDist3 + this.size.x), this.pos.y + this.size.y+1	)){
			this.roomToJump = true;	
		}
		else{
			this.roomToJump = false;	
		}
	},
	checkBackUp: function(){
		//Check for collision tile
		var targetDist = this.size.x + 1;
		var targetDist2 =  this.size.x + this.size.x /2;
		 //Here's a complex chain to determine whether I'm going to walk off a platform or not (dont walk off).
		if (ig.game.collisionMap.getTile(	this.pos.x + (this.flip ?  targetDist : -1), this.pos.y + this.size.y+1	)){
			this.roomToBackUp = true;	
		}
		else{
			this.roomToBackUp = false;
			if (this.backUp && !this.backedUpToTheWall){
				this.vel.x = 0;
				this.backedUpToTheWall = true;
			}
		}
	},
	checkConditions: function(){
		
		//Kill me if player wins
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			if (player.victoryDance && !this.kOTB){
				this.knockMeOutTheBox();
			}
		}

		//Check if I have space to jump
		this.checkJumpRoom();
		
		//Check if I have space to backup
		this.checkBackUp();
		
		if (this.imHit && this.bounceTimer.delta() > 0){
			this.imHit = false;	
			this.bounceDir = null;
		}
		//End the jump 
		if (this.jumping && this.jumpTimer.delta() > 0){
			this.landed = false;
			this.jumping = false;
		}
		
		//Player specific checks intended to FIND the player
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			
			//Figure out which way the player is so I can figure out if I'm facing him
			this.playerDir = player.pos.x + player.size.x < this.pos.x ? "left" : "right";
			
			//Figure out if I'm facing the player
			if (this.playerDir == "left" && this.flip || this.playerDir == "right" && !this.flip ){
				this.facingPlayer = true;
			}
			else {
				this.facingPlayer = false;
			}
		
			//Find distance to player
			this.dtp = this.distanceTo( player);
			this.playerY = player.pos.y + player.size.y;
			
			//If player is closer than sight distance, I am close to the player
			this.closeToPlayer = this.dtp < this.sightDist ? true : false;
			
			//Look for the player
			this.lookForPlayer();
			
		}
		//Manage my sight
		if (this.playerVisible && this.lastSawPlayerTimer.delta() > 0){
			//I havent seen player in a while
			this.playerVisible = false;
			if (this.noticePlayer){
				this.noticePlayer = false;	
			}
		}
		//Logic for when player is not around
		if (!this.noticePlayer){
			//Jump periodically
			if (this.landed && this.jumpTimer.delta() > 0 && !this.jumping){
				if (this.roomToJump ){
					this.jumping = true;
					this.setRandomJumpTime('jump');
				}
			}
			//Notice the player
			if (this.playerY  <= this.pos.y + this.size.y && this.facingPlayer && this.closeToPlayer && !this.pause && this.playerVisible ){
				this.noticePlayer = true;
			}
		}
		//Logic for a noticed player
		else {
			//Jump at the player if he gets too close 
			if ( this.roomToJump && this.dtp < 100 && !this.jumping){
				this.jumping = true;
				this.setRandomJumpTime('jump');
				this.backUp = false;	
			}
			else if (this.backedUpToTheWall){
				this.jumping = true;
				this.setRandomJumpTime('jump');
				this.backUp = false;		
				this.backedUpToTheWall = false;
			}
			//player is too far, run up on him a bit
			else if ( this.roomToJump && this.dtp > 168 && !this.jumping && !this.backUp ){
				this.runUp = true;
			}
			//Player is too close but I dont have room to jump
			else if  ( !this.roomToJump && this.dtp < 120 && !this.jumping && this.landed && !this.runUp ){
				this.backUp = true;
				if ( this.dtp < 72 ){
					this.jumping = true;
					this.setRandomJumpTime('jump');	
				}
			}
			
			
			//Turn off Backup
			if (this.backUp &&  this.dtp > 150 || !this.roomToBackUp){
				this.backUp = false;	
			}
			//Jump at player if im backing up and then have room to jump.
			else if (this.backUp && this.roomToJump && !this.jumping){
				this.backUp = false;	
				this.jumping = true;
				this.setRandomJumpTime('jump');
			}
			//Turn of runup
			if (this.runUp && this.dtp < 125  || !ig.game.collisionMap.getTile(	this.pos.x + (this.flip ? -4 : this.size.x + 4), this.pos.y + this.size.y+1	)){
				this.runUp = false;	
				this.posted = true;
			}
																							  
			if (this.dtp > this.playerEscapeDist){
				this.noticePlayer = false;
			}
			//Face the player
			if (!this.jumping && this.landed){
				if (this.flipTimer.delta() > 0){
					this.flip = this.playerDir == "left" ? true : false;
					this.flipTimer.set(this.flipTimeLimit);
				}
			}
		}
	},
	lookForPlayer: function(){
		if (this.sightTimer.delta() > 0){
			//Look again soon
			this.sightTimer.set(ig.game.sightTime);
			
			//Look for player if Im facing him and close enough
			if (this.facingPlayer && this.closeToPlayer ){
				ig.game.spawnEntity( EntitySight, this.pos.x, this.pos.y, {lookingFor: this.name});
			}
		}
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
		this.speed = 0;

		//Get pause frame
		if (this.currentAnim){
			this.pauseFrame = this.currentAnim.frame;
		}
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
		this.speed = this.storedSpeed;
		
		this.currentAnim.gotoFrame(this.pauseFrame);
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
		
		//Check for bounce and stuff
		this.checkConditions();
		
		if (!this.pause){
			this.movements();
		}
		this.animateMe(); 
		
		if (this.flip == true){
			this.offset.x = 8;
		}
		else {
			this.offset.x = 6;	
		}
		//Kill me if I've been knocked out and I'm way off the screen
		if (this.kOTB){
			this.boundaries();
		}
		this.parent();
	},
	movements: function(){
		//Knocked out the box
		if (this.kOTB){
			if (ig.game.getEntityByName('player')){
				if (this.onGirder && this.kOTB){
					this.onGirder = false;
				}
				var player = ig.game.getEntityByName('player');
				if (player.pos.x > this.pos.x){
					this.vel.x =-220;
				}
				else{
					this.vel.x = 220;	
				}
			}
			if (this.dieUpTimer.delta() < 0){
				var bFF = this.dieUpTimer.delta() * -1;
				this.vel.y = -2000 * bFF;	
			}
			else{
				var bFF = this.dieUpTimer.delta();
				if (bFF > 1){
					bFF = 1;
				}
				this.vel.y = 1000 * bFF;
			}
		}
		else if (this.imHit){
			this.vel.x = this.bounceSpeed * this.bounceDir;
			this.vel.y = 0;
		}
		else if (this.noticePlayer){
			
			//Vel X
			if (this.jumping || !this.landed || this.runUp){
				this.vel.x = this.flip ? -220 : 220;	
			}
			else if (this.backUp){
				this.vel.x = this.flip ? 220 : -220;	
			}
			
			//Vel Y
			if (this.jumping){
				//Random Height
				var randomJumpHeight = -300  //400 +Math.floor(Math.random()*400);
				this.vel.y = randomJumpHeight;	
			}
		}
		else{
			
			//idle
			if (!this.running && !this.idle && this.idleTimer.delta() > 0){
				this.idle = true;	
				var ranVal1 = Math.random();
				var ranVal2 = Math.random() /2;
				var ranVal3 = Math.random() / 2;
				var randomIdleTime = ranVal1 + ranVal2 + ranVal3;
				this.idlingTimer.set(randomIdleTime);
			}
			//Stop idling
			if (this.idle && this.running || this.idle && this.idlingTimer.delta() > 0){
				this.idle = false;
				var whenToIdleAgain = Math.floor(Math.random() * 8) + 2;
				this.idleTimer.set(whenToIdleAgain);
			}
			if (this.idle){
				this.speed = 0;		
			}
			else{
				this.speed = 150;	
			}
			
			var xdir = this.flip ? -1 : 1;
			this.vel.x = this.speed * xdir;
			
			
			
			//Jump
			if (this.jumping){
				//Random Height
				var randomJumpHeight = -300  //400 +Math.floor(Math.random()*400);
				/*if (this.running){
					randomJumpHeight *= 1.33;
				}*/
				this.vel.y = randomJumpHeight;	
				//this.vel.x = 0;
			}
			
			// Near an edge? return!
			if(!this.jumping &&  !ig.game.collisionMap.getTile(	this.pos.x + (this.flip ? +4 : this.size.x -4), this.pos.y + this.size.y+1	) && !this.onGirder && this.landed) {
				if (this.vel.y == 0){
					if (this.flipTimer.delta() > 0){
						this.flip = !this.flip;
						this.flipTimer.set(this.flipTimeLimit);
					}
				}
			}
		}
	},
	animateMe: function(){
		if (this.pause && this.currentAnim){
			this.currentAnim.gotoFrame(this.pauseFrame);	
		}
		else if (this.imHit){
			this.currentAnim = this.anims.damaged;		
		}
		else if (this.vel.y > 0){
			this.currentAnim = this.anims.fall;	
		}
		else if (this.vel.y < 0){
			this.currentAnim = this.anims.jump;	
		}
		else if (this.vel.x != 0 && this.running){
			this.currentAnim = this.anims.run;	
		}
		else if (this.vel.x != 0 ){
			this.currentAnim = this.anims.walk;	
		}
		else{
			this.currentAnim = this.anims.idle;		
		}
		if (this.currentAnim){
			this.currentAnim.flip.x = this.flip;
		}
		
		//Rotation code
		if (this.kOTB && !this.pause){
			this.currentAnim.angle -= Math.PI/.25 * ig.system.tick;
		}
		else{
			this.currentAnim.angle = 0;	
		}
		
	},
	setRandomJumpTime: function(how){
		
		var jumpVal1 = Math.random();
		var jumpVal2 = Math.random() / 2;
		var jumpVal3 = Math.random() / 2;
		if (this.running){
			jumpVal1 /=2;
			jumpVal2 /=2;
			jumpVal3 /=2;
		}
		
		var randomJumpTime = 1;
		
		if (how == "land"){
			randomJumpTime += jumpVal1 + jumpVal2 + jumpVal3;
		}
		else if (how == "jump"){
			randomJumpTime = 0;
			randomJumpTime = .15 + (jumpVal1 + jumpVal2) * .25; // + jumpVal3;
		}
		if (!this.playerVisible){
			randomJumpTime /= 4;	
		}
		//Random Jumps	
		this.jumpTimer.set(randomJumpTime);
	},
	receiveDamage: function( amount, from ) {
		//Hit Sounds
		if (from == "pickaxe" && !this.kOTB){ig.game.pickAxeNoise();}
		this.health -= amount;
		this.anims.damaged.rewind();	
		if( this.health <= 0 && !this.kOTB) {
			ig.game.monkeyDeadNoise();
			this.knockMeOutTheBox();
		}
	},
	kill: function() {
		//this.sfxDie.play();
		this.parent();
		
	},
	
	handleMovementTrace: function( res ) {
		if (this.kOTB){
			//float through walls
			this.pos.x += this.vel.x * ig.system.tick;
			this.pos.y += this.vel.y * ig.system.tick;	
		}
		else{
			this.parent( res );
		
			// Collision with a wall? return!
			if( res.collision.x ) {
				if (this.noticePlayer && this.backUp && !this.jumping){
					this.jumping = true;
					this.setRandomJumpTime('jump');
				}
				else{
					if (this.flipTimer.delta() > 0){
						this.flip = !this.flip;
						this.flipTimer.set(this.flipTimeLimit);
					}
				}
			}
			if ( !this.landed && res.collision.y){
				this.setRandomJumpTime('land');
				this.landed = true;
				this.onGirder = false;
			}
		}
	},
	knockMeOutTheBox: function(){
		this.kOTB = true;
		this.dieUpTimer.set(.35);				
	},
	boundaries: function(){
		if (this.pos.y > ig.system.height * 1.5 + ig.game.screen.y){
			this.kill();
		}
	},
	check: function( other ) {
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			if (other == player && !player.invin ){
				if (!ig.game.quiz && this.attackTimer.delta() > 0 && !this.kOTB && !this.imHit){
					ig.game.monkeyAttackNoise();
					ig.game.quizbox.quiz(1, this.name);
					this.attackTimer.set(ig.game.enemyRecoveryTime);	
				}
			}
			//I will die if the player is invulnerable
			else if (other == player && !this.kOTB && player.invin && !this.imHit){
				this.knockMeOutTheBox();
			}
		}
	}
});
EntitySight = ig.Entity.extend({
	size: {x: 8, y: 8},
	offset: {x: 0, y: 0},
	maxVel: {x: 1000, y: 1000},
	storeMaxVel: {x: 1000, y: 1000},
	pushVel: {x: 0, y: 0},
	storeVel: {x: null, y: null},
	friction: {x: 0, y: 0},
	
	name: "sight",
	zIndex: 1,
	bounciness: 0,
	lookingFor: null,
	
	type: ig.Entity.TYPE.B, 
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	health: 99999,
	speed: 1000,
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		if( !ig.global.wm ) { // not in wm?
			this.harderOnRepeat();
		}
	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		if( !ig.global.wm ) { // not in wm?
			this.harderOnRepeat();
		}

	},
	harderOnRepeat: function(){
		if(ig.game.pData.timesPassed > 0) {
			this.speed = 1500;
		}
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
		this.speed = 0;
		this.pause = true;
	},
	unpaused: function(){
		this.maxVel.x = this.storeMaxVel.x;
		this.maxVel.y = this.storeMaxVel.y;
		this.vel.x = this.storeVel.x;
		this.vel.y = this.storeVel.y;
		this.storeVel.x = null; 
		this.storeVel.y = null;
		this.speed = this.storedSpeed;

		this.pause = false;
	},
	update: function() {
		if (ig.game.dying ){
			this.kill();	
		}
		if ( ig.game.pause && !this.pause ){
			this.paused();
		}
		else if (this.pause && !ig.game.pause){
			this.unpaused();	
		}
		if (!this.pause){
			this.move();
		}
		
		this.parent();
	},

	move: function(){
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player')
			var angle = this.angleTo( player );
			this.vel.x = Math.cos(angle) * this.speed;
			this.vel.y = Math.sin(angle) * this.speed;
		}
	},

	handleMovementTrace: function( res ) {
		
		if ( res.collision.x ||  res.collision.y ||  res.collision.slope){
			this.kill();	
		}
		
		this.parent( res );
		
	},
	
	check: function( other ) {
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			if (other == player && !player.invin && player.amReady ){
				if (ig.game.getEntityByName(this.lookingFor)){
					var enemy = ig.game.getEntityByName(this.lookingFor);
					enemy.playerVisible = true;
					enemy.lastSawPlayerTimer.set(ig.game.lastSawPlayerTimerDefault);
					//console.log(enemy.name + ' sees player');
				}
			}
		}
		this.kill();
	}
});
	ig.EntityPool.enableFor( EntityMonkey );
	ig.EntityPool.enableFor( EntitySight );
});