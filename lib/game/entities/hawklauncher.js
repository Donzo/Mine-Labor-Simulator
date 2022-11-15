ig.module(
	'game.entities.hawklauncher'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
	
EntityHawklauncher = ig.Entity.extend({
	size: {x: 50, y: 50},
	offset: {x: 0, y: 0},
	maxVel: {x: 0, y: 0},
	storeMaxVel: {x: 0, y: 0},
	storeVel: {x: null, y: null},
	friction: {x: 0, y: 0},
	red: false,
	delay: 0,
	
	zIndex: 1,
	
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(66, 208, 245, 1)',
	_wmScalable: true,
	
	type: ig.Entity.TYPE.B, // Evil enemy group
	checkAgainst: ig.Entity.TYPE.NONE, // Check against friendly
	collides: ig.Entity.COLLIDES.NEVER,
	
	health: 9999999,
	respawnTime: 15,
	speed: 0,
	bounceSpeed: 0,
	flip: false,
	idle: false,
	hawkSpawned: false,
	pause: false,
	kOTB: false,
	imHit: false,
	bounceDir: null,
	rate: 1,
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		//Name me
		if( !ig.global.wm ) { 
			this.nameMe();
		}
		this.respawnTimer = new ig.Timer(this.delay);
	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.kOTB = false;
		this.hawkSpawned = false;
		this.respawnTimer.set(this.delay);
		this.nameMe();
	},
	nameMe: function(){
		this.name = "hawkLauncher" + ig.game.hawkLauncherCount;
		ig.game.hawkLauncherCount++;
	},
	spawnHawk: function(){
		if (!this.hawkSpawned && !this.pause && this.respawnTimer.delta() > 0){
			this.hawkSpawned = true;
			var doRed = Math.floor(Math.random() * 11);
			if (doRed >= 9){
				ig.game.spawnEntity( EntityRedhawk, this.pos.x, this.pos.y, {myLauncher: this.name});	
			}
			else{
				ig.game.spawnEntity( EntityHawk, this.pos.x, this.pos.y, {myLauncher: this.name});	
			}
		}
	},
	respawnHawk: function(){
		if (this.red){
			this.respawnTimer.set(this.respawnTime * .66);
		}
		else{
			this.respawnTimer.set(this.respawnTime);	
		}
		this.hawkSpawned = false;
	},
	pauseTimers: function(){
		this.respawnTimer.pause();
	},
	unpauseTimers: function(){
		this.respawnTimer.unpause();
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
		
		this.spawnHawk();
		
		this.parent();
	}
});
EntityHawk = ig.Entity.extend({
	size: {x: 34, y: 20},
	offset: {x: 0, y: 20},
	maxVel: {x: 1000, y: 1000},
	storeMaxVel: {x: 1000, y: 1000},
	storeVel: {x: null, y: null},
	friction: {x: 400, y: 0},
	
	zIndex: 1,
	gravityFactor: 0,
	
	type: ig.Entity.TYPE.B, // Evil enemy group
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.NEVER,
	
	name: null,
	health: 1,
	speed: 100,
	bounceSpeed: 500,
	flip: false,
	pause: false,
	kOTB: false,
	imHit: false,
	bounceDir: null,
	noticePlayer: false,
	playerVisible: false,
	spawnX: null,
	spawnY: null,
	bird: true,
	sightDist: 250, //This is used by DIST to Player
	playerEscapeDist: 400,
	myLauncher: null,
	watchTime: 1.5,
	
	//animSheet: new ig.AnimationSheet( 'media/monkey.png', 36, 30 ),
	
	animSheets: {
		fly: new ig.AnimationSheet( 'media/hawk.png', 34, 50 ),
	},
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.attackTimer = new ig.Timer(0);
		this.boundryTimer = new ig.Timer(0);
		this.dieUpTimer = new ig.Timer(0);
		this.bounceTimer = new ig.Timer(0);
		this.sightTimer = new ig.Timer(0);
		this.lastSawPlayerTimer = new ig.Timer(0);
		
		this.anims.fly = new ig.Animation( this.animSheets.fly, .1, [0,1,2,3,4,5]);
		this.anims.swoop = new ig.Animation( this.animSheets.fly, .05, [6,7,8,9,10,11,12,13,14] );
		this.anims.damaged = new ig.Animation( this.animSheets.fly, .05, [15,16,17,18, 0], true);
		//this.anims.run = new ig.Animation( this.animSheets.walk, .05, [0,1,2,3,4,5,6,7] );
		
		//Name me
		if( !ig.global.wm ) { 
			this.nameMe();
			this.setSpawnPoints();
		}
		//this.addAnim( 'walk', .1, [0,1,2,3,4,5,6,7] );

	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.kOTB = false;
		this.nameMe();
		this.setSpawnPoints();
	},
	nameMe: function(){
		this.name = "hawk" + ig.game.hawkCount;
		ig.game.hawkCount++;
	},
	setSpawnPoints: function(){
		this.spawnX = this.pos.x;
		this.spawnY = this.pos.y;
		
		//Set flip and hence direction based on my position at spawn
		this.flip = this.spawnX <= 0 ? false : true;
	},
	pauseTimers: function(){
		this.bounceTimer.pause();
		this.attackTimer.pause();
		this.dieUpTimer.pause();
		this.sightTimer.pause();
		this.lastSawPlayerTimer.pause();
		this.boundryTimer.pause();
	},
	unpauseTimers: function(){
		this.bounceTimer.unpause();
		this.attackTimer.unpause();
		this.dieUpTimer.unpause();
		this.sightTimer.unpause();
		this.lastSawPlayerTimer.unpause();
		this.boundryTimer.unpause();
	},
	checkConditions: function(){
		
		//Kill me if player wins
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			if (player.victoryDance && !this.kOTB){
				this.knockMeOutTheBox();
			}
		}
		
		//Bounce if Im hit and survive
		if (this.imHit && this.bounceTimer.delta() > 0){
			this.imHit = false;	
			this.bounceDir = null;
		}
		
		//Player specific checks intended to FIND the player
		this.huntPlayer(); 
		
		//Setback last saw timer
		if (this.playerVisible && this.lastSawPlayerTimer.delta() < -this.watchTime){
			 this.lastSawPlayerTimer.set(this.watchTime)	
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
			/*/Jump periodically
			if (this.landed && this.jumpTimer.delta() > 0 && !this.jumping){
				if (this.roomToJump ){
					this.jumping = true;
					this.setRandomJumpTime('jump');
				}
			}
			*/
			//Figure out flight pattern to do when player is unnoticed.
			
			//Notice the player
			if (this.facingPlayer && this.closeToPlayer && !this.pause && this.playerVisible ){
				//console.log(this.name + ' sees the player!');
				this.noticePlayer = true;
			}
		}
		//Logic for a noticed player
		else {
			//Jump at the player if he gets too close 
			
			//Stop noticing player if he escapes																	  
			if (this.dtp > this.playerEscapeDist){
				//console.log('player has escaped by being so far away');
				this.noticePlayer = false;
			}
			/*/Face the player
			if (!this.jumping && this.landed){
				this.flip = this.playerDir == "left" ? true : false;
			}*/
		}
	},
	huntPlayer: function(){
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
			this.playerChest = player.pos.y + (player.size.y / 2);
			
			//If player is closer than sight distance, I am close to the player
			this.closeToPlayer = this.dtp < this.sightDist ? true : false;
			
			//Look for the player
			this.lookForPlayer();
			
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
		
		//Kill me if I've been knocked out and I'm way off the screen
		if (this.kOTB){
			this.boundaries();
		}
		else{
			this.offScreenCheck();	
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
		else if (this.noticePlayer){
			
			//Vel X
			this.vel.x = this.flip ? -220 : 220
			
			//Vel Y
			if (this.playerChest > this.pos.y + this.size.y){
				this.vel.y = 110;
			}
			else if (this.playerChest < this.pos.y - (this.size.y /2)){
				this.vel.y = -110;
			}
		}
		else{
			
			//Vel X
			this.vel.x = this.flip ? -220 : 220
			
			//Vel Y
			this.vel.y = 0;
			
		}
	},
	animateMe: function(){
		if (this.pause && this.currentAnim){
			this.currentAnim.gotoFrame(this.pauseFrame);	
		}
		else if (this.imHit){
			this.currentAnim = this.anims.damaged;		
		}
		else{
			//Swoop if I notice player or just fly
			this.currentAnim = this.noticePlayer ? this.anims.swoop : this.anims.fly;		
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
	receiveDamage: function( amount, from ) {
		//Hit Sounds
		if (from == "pickaxe" && !this.kOTB){ig.game.pickAxeNoise();}
		this.health -= amount;
		this.anims.damaged.rewind();	
		if( this.health <= 0 && !this.kOTB) {
			ig.game.birdDeadNoise();
			this.knockMeOutTheBox();
		}
	},
	kill: function() {
		//this.sfxDie.play();
		this.parent();
		
	},
	
	handleMovementTrace: function( res ) {
		//float through walls
		this.pos.x += this.vel.x * ig.system.tick;
		this.pos.y += this.vel.y * ig.system.tick;	
	},
	knockMeOutTheBox: function(){
		this.kOTB = true;
		this.dieUpTimer.set(.35);				
	},
	offScreenCheck: function(){
		if (this.flip && this.pos.x < 0 - this.size.x && this.boundryTimer.delta() > 0 ||  !this.flip && this.pos.x > ig.game.collisionMap.width * ig.game.collisionMap.tilesize && this.boundryTimer.delta() > 0 ){
			this.pos.x = this.spawnX;
			this.pos.y = this.spawnY;
		}
	},
	boundaries: function(){
		if (this.pos.y > ig.system.height * 1.5 + ig.game.screen.y){
			var myLauncher = ig.game.getEntityByName(this.myLauncher);
			myLauncher.respawnHawk();
			this.kill();
		}
	},
	check: function( other ) {
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			if (other == player && !player.invin ){
				if (this.attackTimer.delta() > 0 && !this.kOTB && !this.imHit){
					ig.game.birdAttackNoise();
					player.receiveDamage(5, this.name);
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
EntityRedhawk = ig.Entity.extend({
	size: {x: 34, y: 20},
	offset: {x: 0, y: 20},
	maxVel: {x: 1000, y: 1000},
	storeMaxVel: {x: 1000, y: 1000},
	storeVel: {x: null, y: null},
	friction: {x: 400, y: 0},
	
	zIndex: 1,
	gravityFactor: 0,
	
	type: ig.Entity.TYPE.B, // Evil enemy group
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.NEVER,
	
	name: null,
	health: 3,
	speed: 100,
	bounceSpeed: 500,
	flip: false,
	pause: false,
	kOTB: false,
	imHit: false,
	bounceDir: null,
	noticePlayer: false,
	playerVisible: false,
	spawnX: null,
	spawnY: null,
	watchTime: 1.25,
	sightDist: 250, //This is used by DIST to Player
	playerEscapeDist: 400,
	myLauncher: null,
	bird: true,
	
	//attackSound: new ig.Sound( 'media/sounds/chihuahua.*' ),
	
	//animSheet: new ig.AnimationSheet( 'media/monkey.png', 36, 30 ),
	
	animSheets: {
		fly: new ig.AnimationSheet( 'media/red-hawk.png', 34, 50 ),
	},
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.attackTimer = new ig.Timer(0);
		this.boundryTimer = new ig.Timer(0);
		this.dieUpTimer = new ig.Timer(0);
		this.bounceTimer = new ig.Timer(0);
		this.sightTimer = new ig.Timer(0);
		this.lastSawPlayerTimer = new ig.Timer(0);
		
		this.anims.fly = new ig.Animation( this.animSheets.fly, .1, [0,1,2,3,4,5]);
		this.anims.swoop = new ig.Animation( this.animSheets.fly, .05, [6,7,8,9,10,11,12,13,14] );
		this.anims.damaged = new ig.Animation( this.animSheets.fly, .05, [15,16,17,18, 0], true);
		//this.anims.run = new ig.Animation( this.animSheets.walk, .05, [0,1,2,3,4,5,6,7] );
		
		//Name me
		if( !ig.global.wm ) { 
			this.nameMe();
			this.setSpawnPoints();
		}
		//this.addAnim( 'walk', .1, [0,1,2,3,4,5,6,7] );

	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.kOTB = false;
		this.nameMe();
		this.setSpawnPoints();
	},
	nameMe: function(){
		this.name = "hawk" + ig.game.hawkCount;
		ig.game.hawkCount++;
	},
	setSpawnPoints: function(){
		this.spawnX = this.pos.x;
		this.spawnY = this.pos.y;
		
		//Set flip and hence direction based on my position at spawn
		this.flip = this.spawnX <= 0 ? false : true;
	},
	pauseTimers: function(){
		this.bounceTimer.pause();
		this.attackTimer.pause();
		this.dieUpTimer.pause();
		this.sightTimer.pause();
		this.lastSawPlayerTimer.pause();
		this.boundryTimer.pause();
	},
	unpauseTimers: function(){
		this.bounceTimer.unpause();
		this.attackTimer.unpause();
		this.dieUpTimer.unpause();
		this.sightTimer.unpause();
		this.lastSawPlayerTimer.unpause();
		this.boundryTimer.unpause();
	},
	checkConditions: function(){
		
		//Kill me if player wins
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			if (player.victoryDance && !this.kOTB){
				this.knockMeOutTheBox();
			}
		}
		
		//Bounce if Im hit and survive
		if (this.imHit && this.bounceTimer.delta() > 0){
			this.imHit = false;	
			this.bounceDir = null;
		}
		
		//Player specific checks intended to FIND the player
		this.huntPlayer(); 
		
		
		//Setback last saw timer
		if (this.playerVisible && this.lastSawPlayerTimer.delta() < -this.watchTime){
			 this.lastSawPlayerTimer.set(this.watchTime)	
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
			/*/Jump periodically
			if (this.landed && this.jumpTimer.delta() > 0 && !this.jumping){
				if (this.roomToJump ){
					this.jumping = true;
					this.setRandomJumpTime('jump');
				}
			}
			*/
			//Figure out flight pattern to do when player is unnoticed.
			
			//Notice the player
			if (this.facingPlayer && this.closeToPlayer && !this.pause && this.playerVisible ){
				this.noticePlayer = true;
			}
		}
		//Logic for a noticed player
		else {
			//Jump at the player if he gets too close 
			
			//Stop noticing player if he escapes																	  
			if (this.dtp > this.playerEscapeDist){
				this.noticePlayer = false;
			}
			/*/Face the player
			if (!this.jumping && this.landed){
				this.flip = this.playerDir == "left" ? true : false;
			}*/
		}
	},
	huntPlayer: function(){
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
			this.playerChest = player.pos.y + (player.size.y / 2);
			
			//If player is closer than sight distance, I am close to the player
			this.closeToPlayer = this.dtp < this.sightDist ? true : false;
			
			//Look for the player
			this.lookForPlayer();
			
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
		
		//Kill me if I've been knocked out and I'm way off the screen
		if (this.kOTB){
			this.boundaries();
		}
		else{
			this.offScreenCheck();	
		}
		this.parent();
	},
	movements: function(){
		//Knocked out the box
		if (this.kOTB){
			if (ig.game.getEntityByName('player')){
				var player = ig.game.getEntityByName('player');
				if (player.pos.x > this.pos.x){
					this.vel.x =-250;
				}
				else{
					this.vel.x = 250;	
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
			this.vel.x = this.flip ? -250 : 250
			
			//Vel Y
			if (this.playerChest > this.pos.y + this.size.y){
				this.vel.y = 125;
			}
			else if (this.playerChest < this.pos.y - (this.size.y /2)){
				this.vel.y = -125;
			}
		}
		else{
			
			//Vel X
			this.vel.x = this.flip ? -250 : 250
			
			//Vel Y
			this.vel.y = 0;
			
		}
	},
	animateMe: function(){
		if (this.pause && this.currentAnim){
			this.currentAnim.gotoFrame(this.pauseFrame);	
		}
		else if (this.imHit){
			this.currentAnim = this.anims.damaged;		
		}
		else{
			//Swoop if I notice player or just fly
			this.currentAnim = this.noticePlayer ? this.anims.swoop : this.anims.fly;	
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
	receiveDamage: function( amount, from ) {
		this.health -= amount;
		//Hit Sounds
		if (from == "pickaxe" && !this.kOTB){ig.game.pickAxeNoise();}
		
		this.anims.damaged.rewind();	
		if( this.health <= 0 && !this.kOTB) {
			ig.game.birdDeadNoise();
			this.knockMeOutTheBox();
		}
	},
	kill: function() {
		//this.sfxDie.play();
		this.parent();
		
	},
	
	handleMovementTrace: function( res ) {
		//float through walls
		this.pos.x += this.vel.x * ig.system.tick;
		this.pos.y += this.vel.y * ig.system.tick;	
	},
	knockMeOutTheBox: function(){
		this.kOTB = true;
		this.dieUpTimer.set(.35);				
	},
	offScreenCheck: function(){
		if (this.flip && this.pos.x < 0 - this.size.x && this.boundryTimer.delta() > 0 ||  !this.flip && this.pos.x > ig.game.collisionMap.width * ig.game.collisionMap.tilesize && this.boundryTimer.delta() > 0 ){
			this.pos.x = this.spawnX;
			this.pos.y = this.spawnY;
		}
	},
	boundaries: function(){
		if (this.pos.y > ig.system.height * 1.5 + ig.game.screen.y){
			var myLauncher = ig.game.getEntityByName(this.myLauncher);
			myLauncher.respawnHawk();
			this.kill();
		}
	},
	check: function( other ) {
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			if (other == player && !player.invin ){
				if (this.attackTimer.delta() > 0 && !this.kOTB && !this.imHit){
					ig.game.birdAttackNoise();
					player.receiveDamage(15, this.name);
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
	ig.EntityPool.enableFor( EntityRedhawk );
	ig.EntityPool.enableFor( EntityHawk );
	ig.EntityPool.enableFor( EntityHawklauncher );
});