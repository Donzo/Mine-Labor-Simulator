ig.module(
	'game.entities.rockdumper'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
	
EntityRockdumper = ig.Entity.extend({
	size: {x: 25, y: 25},
	offset: {x: 0, y: 0},
	maxVel: {x: 0, y: 0},
	storeMaxVel: {x: 0, y: 0},
	storeVel: {x: null, y: null},
	friction: {x: 0, y: 0},
	
	zIndex: 1,
	
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(66, 208, 245, 1)',
	_wmScalable: true,
	
	type: ig.Entity.TYPE.B, // Evil enemy group
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	health: 9999999,
	speed: 0,
	bounceSpeed: 0,
	flip: false,
	idle: false,
	dumpTime: 3, //BaSE dump time
	randomDumpTime: true,
	pause: false,
	kOTB: false,
	imHit: false,
	bounceDir: null,
	rate: 1,
	slow: false,
	slowFactor: .66,
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		var randomDumpTime = 1+Math.floor(Math.random()*3);
		this.dumpTimer = new ig.Timer(randomDumpTime);

	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.kOTB = false;
		this.setRandomDumpTime();

	},
	dumpRocks: function(){
		if (!this.pause && this.dumpTimer.delta() > 0){
			var rdt = this.dumpTime != 3 ?  this.dumpTime + Math.floor(Math.random()) : 1+Math.floor(Math.random()*3);
			
			this.dumpTimer.set(rdt);
			
			var randomDecimal =  (1+Math.floor(Math.random()*100)) / 100;
			var randomDumpX = this.pos.x + (this.size.x * randomDecimal);
			
			ig.game.spawnEntity( EntityRock, randomDumpX, this.pos.y, {slow: this.slow, slowFactor: this.slowFactor});	
		}
	},
	pauseTimers: function(){
		this.dumpTimer.pause();
	},
	unpauseTimers: function(){
		this.dumpTimer.unpause();
	},
	paused: function(){
		this.pauseTimers();
		this.pause = true;
	},
	unpaused: function(){
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
		
		this.dumpRocks();
		
		this.parent();
	},
	
	setRandomDumpTime: function(){
		var randomDumpTime1 = Math.floor(Math.random()*3);
		var randomDumpTime2 = Math.floor(Math.random()*3);
		var randomDumpTime3 = 1 + Math.floor(Math.random()*3);
		
		this.randomDumpTimeValue = randomDumpTime1 + randomDumpTime2 + randomDumpTime3;
	}
});
EntityRock= ig.Entity.extend({
	size: {x: 20, y: 20},
	offset: {x: 2, y: 2},
	maxVel: {x: 1000, y: 1000},
	storeMaxVel: {x: 1000, y: 1000},
	storeVel: {x: null, y: null},
	friction: {x: 400, y: 0},
	
	zIndex: 1,
	
	
	type: ig.Entity.TYPE.B, // Evil enemy group
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.NEVER,
	
	health: 1,
	speed: 450,
	bounceSpeed: 450,
	runWaitTime: 2.5,
	drop: false,
	dropping: false,
	flip: false,
	idle: false,
	pause: false,
	kOTB: false,
	imHit: false,
	bounceDir: null,
	mode: "falling",
	randomVelX: null,
	wallBumpCount: 0,
	whichRock: 1,
	fallRate: 450,
	name:"rock",
	slow: false,
	slowFactor: .66,
	
	//attackSound: new ig.Sound( 'media/sounds/chihuahua.*' ),

	animSheets: {
		rocks: new ig.AnimationSheet( 'media/rocks.png', 24, 24 ),
		//jump: new ig.AnimationSheet( 'media/monkey-jumping.png', 42, 40 ),
	},
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.droppingTimer = new ig.Timer(0);
		this.dropTimer = new ig.Timer(0);
		this.dieUpTimer = new ig.Timer(0);
		this.whichRock =  1+Math.floor(Math.random()*8);
		this.setRandomDirX();
		//var randomJumpTime = 1+Math.floor(Math.random()*3);
		//this.jumpTimer = new ig.Timer(randomJumpTime);
		//this.bounceTimer = new ig.Timer(0);
		
		this.anims.rockOne = new ig.Animation( this.animSheets.rocks, 1, [0], true);
		this.anims.rockTwo = new ig.Animation( this.animSheets.rocks, 1, [1], true);
		this.anims.rockThree = new ig.Animation( this.animSheets.rocks, 1, [2], true);
		this.anims.rockFour = new ig.Animation( this.animSheets.rocks, 1, [3], true);
		this.anims.rockFive = new ig.Animation( this.animSheets.rocks, 1, [4], true);
		this.anims.rockSix = new ig.Animation( this.animSheets.rocks, 1, [5], true);
		this.anims.rockSeven = new ig.Animation( this.animSheets.rocks, 1, [6], true);
		this.anims.rockEight = new ig.Animation( this.animSheets.rocks, 1, [7], true);
		if (ig.game.pData.timesPassed > 0){
			this.slowFactor = 1;	
		}
	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.whichRock =  1+Math.floor(Math.random()*8);
		this.setRandomDirX();
		this.kOTB = false;
		this.mode = "falling";
		if (ig.game.pData.timesPassed > 0){
			this.slowFactor = 1;	
		}
	},
	pauseTimers: function(){
		this.dieUpTimer.pause();
		this.dropTimer.pause();
		this.droppingTimer.pause();
	},
	unpauseTimers: function(){
		this.dropTimer.unpause();
		this.droppingTimer.unpause();
		this.dieUpTimer.unpause();
	},
	checkConditions: function(){
		//Kill me if player wins
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			if (player.victoryDance && !this.kOTB){
				this.knockMeOutTheBox();
			}
		}
		//Check conditions
		if (this.dropping && this.droppingTimer.delta() > 0){
			this.dropping = false;
			this.setRandomDropTime();
		}
		if (this.dropTimer.delta() > 0 && !this.drop || this.wallBumpCount >= 2){
			this.drop = true;
			this.dropLevel();
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
		}
		else if (this.mode == "falling"){
			this.vel.x = 0;
			//If Im slow, use slowfactor to slow the rate of my fall
			this.vel.y = this.slow ? this.fallRate * this.slowFactor : this.fallRate;
		}
		else if (this.mode == "rolling"){
				if (this.flip ){
					if (this.hitGround){
						this.vel.x = this.slow ? this.randomVelX * this.slowFactor : this.randomVelX;
					}
					else{
						this.vel.x = 0;	
					}
					this.vel.y = this.slow ? this.fallRate * this.slowFactor : this.fallRate;
				}
				else{
					if (this.hitGround){
						this.vel.x = this.slow ? this.randomVelX * this.slowFactor : this.randomVelX;
					}	
					else{
						this.vel.x = 0;	
					}
					this.vel.y = this.slow ? this.fallRate * this.slowFactor : this.fallRate;
				}
				
		}
	},
	setRandomDirX: function(){
		//find player
		if (ig.game.getEntityByName('player') && !this.randomVelX ){
			var player = ig.game.getEntityByName('player');
			var randomVelX = 50+Math.floor(Math.random()*250);
			var randomDirX = 1+Math.floor(Math.random()*1000);
			var dirX = "right";
			var favorDir = player.pos.x > this.pos.x ? "right" : "left";
			//This gives us a 6.6 out of 10 chance to head toward the player
			if (favorDir == "right"){
				randomDirX = randomDirX > 660 ? -1 : 1;
			}
			else{
				randomDirX = randomDirX > 660 ? 1 : -1;
			}
			this.randomVelX = randomVelX * randomDirX;
		}
	},
	setRandomDropTime: function(){
		var randomDropTime1 = 2+Math.floor(Math.random()*3);
		var randomDropTime2 = 2+Math.floor(Math.random()*3);
		var randomDropTime3 = 2+Math.floor(Math.random()*3);
		var theDropTime = randomDropTime1 + randomDropTime2 + randomDropTime3;
		this.drop = false;
		this.dropTimer.set(theDropTime);
	},
	dropLevel: function(){
		this.droppingTimer.set(.3);
		this.dropping = true;
		this.hitGround = false;
		this.wallBumpCount = 0;
		this.setRandomDirX();
	},
	animateMe: function(){
		if (this.pause && this.currentAnim){
			this.currentAnim.gotoFrame(this.pauseFrame);	
		}
		else{
			if (this.whichRock == 1){
				this.currentAnim = this.anims.rockOne;	
			}
			else if (this.whichRock == 2){
				this.currentAnim = this.anims.rockTwo;	
			}
			else if (this.whichRock == 3){
				this.currentAnim = this.anims.rockThree;	
			}
			else if (this.whichRock == 4){
				this.currentAnim = this.anims.rockFour;	
			}
			else if (this.whichRock == 5){
				this.currentAnim = this.anims.rockFive;	
			}
			else if (this.whichRock == 6){
				this.currentAnim = this.anims.rockSix;	
			}
			else if (this.whichRock == 7){
				this.currentAnim = this.anims.rockSeven;	
			}
			else if (this.whichRock == 8){
				this.currentAnim = this.anims.rockEight;	
			}
			else{
				console.log(	'What s up with this.whichRock =' + this.whichRock);
			}
		}
		if (this.currentAnim){
			this.currentAnim.flip.x = this.flip;
		}
		//Rotation code
		if (this.kOTB && !this.pause){
			this.currentAnim.angle -= Math.PI/.25 * ig.system.tick;
		}
		else if ( !this.pause && this.vel.x < 0){
			if (this.vel.x <= -200){
				this.currentAnim.angle -= Math.PI/.2 * ig.system.tick;
			}
			else if (this.vel.x <= -100){
				this.currentAnim.angle -= Math.PI/.35 * ig.system.tick;
			}
			else{
				this.currentAnim.angle -= Math.PI/.5 * ig.system.tick;
			}
		}
		else if (!this.pause && this.vel.x > 0){
			if (this.vel.x >= 200){
				this.currentAnim.angle += Math.PI/.2 * ig.system.tick;
			}
			else if (this.vel.x >= 100){
				this.currentAnim.angle += Math.PI/.35 * ig.system.tick;
			}
			else{
				this.currentAnim.angle += Math.PI/.5 * ig.system.tick;
			}
		}
		else{
			this.currentAnim.angle = 0;	
		}
		
	},
	receiveDamage: function( amount, from ) {
		//Hit Sounds
		if (from == "pickaxe" && !this.kOTB){ig.game.pickAxeNoise(); }
		this.health -= amount;
		
		if( this.health <= 0 && !this.kOTB ) {
			this.knockMeOutTheBox();
			ig.game.pickAxeNoise();
		}
	},
	kill: function() {
		//this.sfxDie.play();
		this.parent();
	},
	
	handleMovementTrace: function( res ) {
		if (this.kOTB || this.dropping){
			//float through walls
			this.pos.x += this.vel.x * ig.system.tick;
			this.pos.y += this.vel.y * ig.system.tick;	
		}
		else{
			this.parent( res );
		
			// Collision with a wall? return!
			if( res.collision.x ) {
				this.randomVelX *= -1;  
				this.wallBumpCount++;
			}
			if (!this.hitGround && res.collision.y || !this.hitGround && res.collision.slope){
				this.mode = "rolling";
				this.hitGround = true;
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
				if (!this.kOTB && !this.imHit){
					ig.game.rockHitNoise();
					player.receiveDamage(10,"rock");
				}
			}
			//I will die if the player is invulnerable
			else if (other == player && !this.kOTB && player.invin && !this.imHit){
				this.knockMeOutTheBox();
			}
		}
	}
});
	ig.EntityPool.enableFor( EntityRockdumper );
	ig.EntityPool.enableFor( EntityRock );
});