ig.module(
	'game.entities.snowmonster'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
	
EntitySnowmonster = ig.Entity.extend({
	size: {x: 40, y: 82},
	offset: {x: 0, y: 55},
	maxVel: {x: 1000, y: 1000},
	storeMaxVel: {x: 1000, y: 1000},
	storeVel: {x: null, y: null},
	friction: {x: 400, y: 0},
	snowBallCount: 0,
	
	zIndex: 3,
	gravityFactor: 1,
	
	type: ig.Entity.TYPE.B, // Evil enemy group
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	name: null,
	health: 5,
	speed: 100,
	bounceSpeed: 500,
	running: false,
	flip: false,
	idle: false,
	pause: false,
	kOTB: false,
	imHit: false,
	bounceDir: null,
	throwResponse: false,
	spawnSnowBall: false,
	landed: false,
	onGirder: false,
	noticePlayer: false,
	playerVisible: false,
	roomToBackUp: true,
	sightDist: 416, //This is used by DIST to Player
	playerEscapeDist: 832,
	flipTimeLimit: .15,
	onASmallPlatform: false,
	
	//attackSound: new ig.Sound( 'media/sounds/chihuahua.*' ),
	
	//animSheet: new ig.AnimationSheet( 'media/monkey.png', 36, 30 ),
	
	animSheets: {
		walk: new ig.AnimationSheet( 'media/snow-monster.png', 150, 144 ),
		//jump: new ig.AnimationSheet( 'media/monkey-jumping.png', 42, 40 ),
	},
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.attackTimer = new ig.Timer(0);
		this.dieUpTimer = new ig.Timer(0);
		this.bounceTimer = new ig.Timer(0);
		this.sightTimer = new ig.Timer(0);
		this.runTimer = new ig.Timer(0);
		this.lastSawPlayerTimer = new ig.Timer(0);
		this.flipTimer = new ig.Timer(0);
		this.snowThrowTimer = new ig.Timer(0);
		
		this.anims.walk = new ig.Animation( this.animSheets.walk, .1, [0,1,2,3,4,5,6]);
		this.anims.run = new ig.Animation( this.animSheets.walk, .05, [0,1,2,3,4,5,6]);
		this.anims.throwSnowBall = new ig.Animation( this.animSheets.walk, .1, [7,8,9,10, 11, 12, 13, 14, 15, 16], true);
		this.anims.damaged = new ig.Animation( this.animSheets.walk, .05, [17,18,19,20,21,22] );
		this.anims.idle = new ig.Animation( this.animSheets.walk, .1, [02] );
		
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
		this.snowBallCount = 0;
		this.onASmallPlatform = false;
	},
	nameMe: function(){
		this.name = "snowMonster" + ig.game.snowMonsterCount;
		ig.game.snowMonsterCount++;
	},
	pauseTimers: function(){
		this.bounceTimer.pause();
		this.flipTimer.pause();
		this.attackTimer.pause();
		this.dieUpTimer.pause();
		this.sightTimer.pause();
		this.snowThrowTimer.pause();
		this.lastSawPlayerTimer.pause();
	},
	unpauseTimers: function(){
		this.flipTimer.unpause();
		this.bounceTimer.unpause();
		this.attackTimer.unpause();
		this.dieUpTimer.unpause();
		this.sightTimer.unpause();
		this.snowThrowTimer.unpause();
		this.lastSawPlayerTimer.unpause();
	},
	throwSnow: function(){
		this.facePlayer();
		this.throwingSnow = true;
		this.anims.throwSnowBall.rewind();	
		this.snowThrowTimer.set(1.5);
	},
	runUp: function(){
		this.running = true;	
		 this.snowBallCount = 0;
		this.runTimer.set(3);
	},
	handleSnow: function(){
		//Spawn snowball
		if (this.snowThrowTimer.delta() >= -1 && !this.spawnSnowBall && !this.kOTB  ){
			this.facePlayer();
			this.spawnSnowBall = true;
			var sbPosX = this.pos.x + (this.flip ? -44 : 60);
			var sbPosY = this.pos.y - 25;
			ig.game.spawnEntity( EntitySnowball, sbPosX, sbPosY, {flip: this.flip});
		}
		//Stop throwing snow
		if (this.spawnSnowBall && this.snowThrowTimer.delta() >= 0 ){
			this.throwingSnow = false;
			this.spawnSnowBall = false;
			this.throwResponse = false;	
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
		
		if ( !ig.game.collisionMap.getTile(	this.pos.x + 64, this.pos.y + this.size.y + 2	) &&  !ig.game.collisionMap.getTile(	this.pos.x + -32, this.pos.y + this.size.y + 2	) ) {
			this.onASmallPlatform = true;
		}
		else{
			this.onASmallPlatform = false;		
		}
		
		//Stop bouncing
		if (this.imHit && this.bounceTimer.delta() > 0){
			this.imHit = false;	
			this.bounceDir = null;
		}

		//Stop Running
		if (this.running && this.runTimer.delta() > 0){
			this.running = false;
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
			if (this.throwingSnow){
				this.handleSnow();
			}
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
			
			//Notice the player
			if (this.playerY  <= this.pos.y + this.size.y && this.facingPlayer && this.closeToPlayer && !this.pause && this.playerVisible ){
				this.noticePlayer = true;
			}
		}
		//Logic for a noticed player
		else {
			var throwX = 192;
			var chargeX = 128;
			
			
			
			//I see player logic
			if ( this.dtp >throwX && !this.throwingSnow && !this.kOTB  && !this.running  || this.throwResponse && !this.imHit && !this.throwingSnow ){
				if ( this.snowBallCount > 3  && !this.throwingSnow  && !this.running && !this.kOTB){
					this.runUp();
				}
				else if (!this.spawnSnowBall){				
					this.throwSnow();
					this.snowBallCount++;
				}
			}
			if ( this.dtp < chargeX && !this.throwingSnow && !this.running && !this.kOTB ){
				this.runUp();
			}
			//Let player get away																	  
			if (this.dtp > this.playerEscapeDist){
				this.noticePlayer = false;
			}
		}
	},
	facePlayer: function(){
		var player = ig.game.getEntityByName('player');
		this.flip = player.pos.x > this.pos.x ? false : true;
	},
	lookForPlayer: function(){
		if (this.sightTimer.delta() > 0){
			//Look again soon
			this.sightTimer.set(ig.game.sightTime / 4);
			
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
			this.offset.x = 56;
		}
		else {
			this.offset.x = 56;	
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
		else if (this.onASmallPlatform){
			this.facePlayer();
			this.vel.x = 0;
		}
		else if (this.noticePlayer){
			
			//Vel X
			if (this.throwingSnow){
				this.vel.x = 0;
			}
			else if (this.running){
				this.vel.x = this.flip ? -180 : 180;	
			}
			else{
				this.vel.x = this.flip ? -90 : 90;		
			}
		}
		else{
			if (this.throwingSnow){
				this.vel.x = 0;	
			}
			else if (this.running){
				this.vel.x = this.flip ? -180 : 180;	
			}
			else{
				this.vel.x = this.flip ? -90 : 90;	
			}
		}
		// Near an edge? return!
		var tileCheck = 48;
		if(  !ig.game.collisionMap.getTile(	this.pos.x + (this.flip ? -tileCheck : +this.size.x + tileCheck), this.pos.y + this.size.y + 2	) && this.landed) {
			if (this.vel.y == 0){
				if (this.flipTimer.delta() > 0 && !this.onASmallPlatform && !this.throwingSnow){
					this.flip = !this.flip;
					this.flipTimer.set(this.flipTimeLimit);
				}
			}
		}
	},
	animateMe: function(){
		if (this.pause && this.currentAnim){
			this.currentAnim.gotoFrame(this.pauseFrame);	
		}
		else if (this.kOTB){
			this.currentAnim = this.anims.idle;	 
		}
		else if (this.imHit){
			this.currentAnim = this.anims.damaged;		
		}
		else if (this.throwingSnow){
			this.currentAnim = this.anims.throwSnowBall;
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
			this.currentAnim.angle -= Math.PI/.35 * ig.system.tick;
		}
		else{
			this.currentAnim.angle = 0;	
		}
		
	},
	receiveDamage: function( amount, from ) {
		this.facePlayer();
		//Hit Sounds
		if (from == "pickaxe" && !this.kOTB){ig.game.pickAxeNoise();}
		
		this.health -= amount;
		this.anims.damaged.rewind();	
		this.bounceTimer.set(.6);
		//RandomlyThrowSnowInResponseToDamage
		var rtsirtd = 1+Math.floor(Math.random()*100);
		this.throwResponse = rtsirtd > 50 ? true : false;

		if( this.health <= 0 && !this.kOTB) {
			ig.game.snowMonsterDeadNoise();
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
				if (this.flipTimer.delta() > 0 && !this.throwingSnow){
					this.flip = !this.flip;
					this.flipTimer.set(this.flipTimeLimit);
				}
			}
			if ( !this.landed && res.collision.y){
				this.landed = true;
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
					ig.game.quizbox.quiz(1, this.name);
					ig.game.snowMonsterAttackNoise();
					this.attackTimer.set(ig.game.enemyRecoveryTime);	
				}
			}
		}
	}
});
EntitySnowball = ig.Entity.extend({
	size: {x: 28, y: 28},
	offset: {x: 40, y: 15},
	maxVel: {x: 1000, y: 1000},
	storeMaxVel: {x: 1000, y: 1000},
	storeVel: {x: null, y: null},
	friction: {x: 400, y: 0},
	xPath: null,
	yPath: null,
	velWalled: false,
	//snowBallSound: new ig.Sound ('media/sounds/toss-spear.*'),
	type: ig.Entity.TYPE.B, // Evil enemy group
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.NEVER,
	zIndex: -3,
	health: 1,
	gravity:0,
	pause: false,
	kOTB: false,
	imHit: false,
	bounceDir: null,
	speed: 250,
	storedSpeed: null,
	flip: false,
	name: "snowball",
	
	animSheet: new ig.AnimationSheet( 'media/snowball.png', 108, 63 ),
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.dieUpTimer = new ig.Timer(0);
		this.meltTimer = new ig.Timer(0);
		//this.throwSpear.volume = .50;
		this.addAnim( 'fly', 1, [0] ); 
		this.addAnim( 'splatter', 0.1, [1,2,3,4,5], true ); 
				
		this.setShot();
		ig.game.sortEntitiesDeferred();
	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.kOTB = false;
		this.splatter = false;
		this.walled = false;
		this.setShot();
		ig.game.sortEntitiesDeferred();
	},
	setShot: function(){
		//SHOOT AT PLAYER
		var player = ig.game.getEntityByName('player');
		var angle = this.angleTo( player );
		this.vel.x = Math.cos(angle) * this.speed;
		
		var addThis = this.flip ? -132 : 116;
		this.xPath = this.vel.x + addThis;
		this.vel.y = Math.sin(angle) * this.speed;
		this.yPath = this.vel.y;
		if (!ig.game.pause){
			ig.game.snowballNoise();
		}
	},
	knockMeOutTheBox: function(){
		this.kOTB = true;
		this.dieUpTimer.set(.35);				
	},
	pauseTimers: function(){
		this.dieUpTimer.pause();
		this.meltTimer.pause();
	},
	unpauseTimers: function(){
		this.dieUpTimer.unpause();
		this.meltTimer.unpause();
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
		
		//Kill me if I've been knocked out and I'm way off the screen
		if (this.kOTB){
			this.boundaries();
		}
		this.parent();
	},
	checkConditions: function(){
		//Kill me if player wins
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			if (player.victoryDance && !this.kOTB){
				this.knockMeOutTheBox();
			}
		}
		
		this.offset.y = this.splatter ? 30 : 15;	
		
		//Melt me
		if (this.splatter && this.meltTimer.delta() > 0){
			this.kill();	
		}
	},
	movements: function(){
		 //Splattered
		 if (this.splatter ){
			this.vel.x = 0;
			this.vel.y = 0;
		}
		//Knocked out the box
		else if (this.kOTB){
			if (ig.game.getEntityByName('player')){
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
		}
		else if (this.walled){
			this.vel.y = 400;
			if (!this.velWalled){
				this.walledX = (this.vel.x * -1) *.1;
			}
			this.vel.x = this.walledX;
		}
		else{
			this.vel.x = this.xPath;
			this.vel.y = this.yPath;
		}
	},
	splatterMe: function(){
		this.splatter = true;
		this.meltTimer.set(3);
		this.anims.splatter.rewind();	
		ig.game.snowballMissNoise();
	},
	animateMe: function(){
		if (this.pause && this.currentAnim){
			this.currentAnim.gotoFrame(this.pauseFrame);	
		}
		else{
			if (!this.splatter ){
				this.currentAnim = this.anims.fly;	
			}
			else if (this.splatter ){
				this.currentAnim = this.anims.splatter;	
			}
		}
		if (this.currentAnim){
			this.currentAnim.flip.x = this.flip;
		}
		//Rotation code
		if (this.kOTB && !this.pause && !this.splatter){
			this.currentAnim.angle -= Math.PI/.25 * ig.system.tick;
		}
		else if ( !this.pause && this.vel.x < 0 && !this.splatter){
			this.currentAnim.angle -= Math.PI/.75 * ig.system.tick;
		}
		else if (!this.pause && this.vel.x > 0 && !this.splatter){
			this.currentAnim.angle += Math.PI/.75 * ig.system.tick;
		}
		else{
			this.currentAnim.angle = 0;	
		}
		
	},
	receiveDamage: function( amount, from ) {
		this.health -= amount;
		
		if( this.health <= 0 ) {
			this.knockMeOutTheBox();
		}
	},
	handleMovementTrace: function( res ) {
		this.parent( res );
		if( res.collision.y && !this.splatter  || res.collision.slope  && !this.splatter ) {
			this.splatterMe();
		}
		if ( res.collision.x && !this.splatter && !this.walled){
			this.walled = true;	
		}
	},
	boundaries: function(){
		if (this.pos.y > ig.system.height * 1.5 + ig.game.screen.y){
			this.kill();
		}
	},
	check: function( other ) {
		
		if (ig.game.getEntityByName('player')){
			//Snowball hit sound
			if (!ig.game.muteGame) {
				//this.snowBallSound.play();
			}
			var player = ig.game.getEntityByName('player');
			if (other == player && !player.invin && !this.splatter ){
				if (!ig.game.quiz && !this.imHit){
					ig.game.snowballHitNoise();
					ig.game.quizbox.quiz(1, this.name);
					this.walled = true;
				}
			}
			//I will die if the player is invulnerable
			else if (other == player && !this.kOTB && player.invin && !this.imHit){
				this.knockMeOutTheBox();
			}
		}
	}
});
	ig.EntityPool.enableFor( EntitySnowmonster );
	ig.EntityPool.enableFor( EntitySnowball );
});