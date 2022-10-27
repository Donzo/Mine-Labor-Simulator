ig.module(
	'game.entities.miningbrick'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
	
EntityMiningbrick = ig.Entity.extend({
	size: {x: 32, y: 32},
	offset: {x: 0, y: 0},
	maxVel: {x: 0, y: 0},

	zIndex: -10,
	bounciness: 0,
	landed: false,
	type: ig.Entity.TYPE.NONE, 
	checkAgainst: ig.Entity.TYPE.A, 
	collides: ig.Entity.COLLIDES.NEVER,
	broke: false,
	rT: 3,
	restoring: false,
	noRestore: false,
	facade: false,
	health: 1000,
	//health: 30,
	name: "miningbrick",
	breakTime: 1,
	rubbleSpawned: false,
	animType:1,
	animTypes:6,
	animSheet: new ig.AnimationSheet( 'media/mining-brick.png', 32, 32 ),
	
	breakSound: new ig.Sound( 'media/sounds/crumble-brick-break.*' ),
	buildSound: new ig.Sound( 'media/sounds/crumble-brick-restore.*' ),
	crackSound: new ig.Sound( 'media/sounds/crumble-brick-crack.*' ),
	
	pause: false,
	lvlBeat: false,
	
	spawnCollisionTiles: function(){
		var xTiles = 0;
		var xPos = 0;
		var yTiles = 0;
		
		while (xTiles < 4){
			ig.game.collisionMap.setTile( this.pos.x + xPos, this.pos.y, 1 );	
			ig.game.collisionMap.setTile( this.pos.x + xPos, this.pos.y + 8, 1 );	
			ig.game.collisionMap.setTile( this.pos.x + xPos, this.pos.y + 16, 1 );	
			ig.game.collisionMap.setTile( this.pos.x + xPos, this.pos.y + 24, 1 );	
			ig.game.collisionMap.setTile( this.pos.x + xPos, this.pos.y + 31, 1 );	
			xPos += 8;
			xTiles++;
		}
	},
	removeCollisionTiles: function(){
		var xTiles = 0;
		var xPos = 0;
		var yTiles = 0;
		
		while (xTiles < 4){
			ig.game.collisionMap.setTile( this.pos.x + xPos, this.pos.y, 0 );	
			ig.game.collisionMap.setTile( this.pos.x + xPos, this.pos.y + 8, 0 );	
			ig.game.collisionMap.setTile( this.pos.x + xPos, this.pos.y + 16, 0 );	
			ig.game.collisionMap.setTile( this.pos.x + xPos, this.pos.y + 24, 0 );	
			ig.game.collisionMap.setTile( this.pos.x + xPos, this.pos.y + 31, 0 );	
			xPos += 8;
			xTiles++;
		}
	},
	pauseTimers: function(){
		this.breakTimer.pause();
	},
	unpauseTimers: function(){
		this.breakTimer.unpause();
	},
	paused: function(){
		this.pauseTimers();
		this.pause = true;
	},
	unpaused: function(){	
		this.unpauseTimers();
		this.pause = false;
	},
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.soundPlayingTimer = new ig.Timer(.1);
		this.breakTimer = new ig.Timer(1);
		//Anims
		this.addAnim( 'bricka', 1, [0], true );	
		this.addAnim( 'hurt1a', 1, [1], true );	
		this.addAnim( 'hurt2a', 1, [2], true );	
		this.addAnim( 'hurt3a', 1, [3], true );	
		this.addAnim( 'hurt4a', 1, [4], true );
		this.addAnim( 'brickb', 1, [9], true );	
		this.addAnim( 'hurt1b', 1, [10], true );	
		this.addAnim( 'hurt2b', 1, [11], true );	
		this.addAnim( 'hurt3b', 1, [12], true );	
		this.addAnim( 'hurt4b', 1, [13], true );
		this.addAnim( 'brickc', 1, [14], true );	
		this.addAnim( 'hurt1c', 1, [15], true );	
		this.addAnim( 'hurt2c', 1, [16], true );	
		this.addAnim( 'hurt3c', 1, [17], true );	
		this.addAnim( 'hurt4c', 1, [18], true );
		this.addAnim( 'brickd', 1, [19], true );	
		this.addAnim( 'hurt1d', 1, [20], true );	
		this.addAnim( 'hurt2d', 1, [21], true );	
		this.addAnim( 'hurt3d', 1, [22], true );	
		this.addAnim( 'hurt4d', 1, [23], true );
		this.addAnim( 'bricke', 1, [24], true );	
		this.addAnim( 'hurt1e', 1, [25], true );	
		this.addAnim( 'hurt2e', 1, [26], true );	
		this.addAnim( 'hurt3e', 1, [27], true );	
		this.addAnim( 'hurt4e', 1, [28], true );
		this.addAnim( 'breakMe', .05, [5,6,7,8], true );	
		if( !ig.global.wm ) { // not in wm?
			ig.game.sortEntitiesDeferred();
			this.getAnimType(1,this.animTypes);
		}
		
	},
	reset: function( x, y, settings ) {
		if( !ig.global.wm ) { // not in wm?
			ig.game.sortEntitiesDeferred();
		}
		this.rubble1 = false;
		this.rubble2 = false;
		this.rubble3 = false;
		this.rubble4 = false;
		this.rubble5 = false;
		this.rubble6 = false;
		this.broke = false;
		this.rubbleSpawned = false;
		this.collides = ig.Entity.COLLIDES.FIXED;
		this.lvlBeat = false;
		this.getAnimType(1,this.animTypes);
		this.parent( x, y, settings );
	},

	spawnRubble: function(whichRow){
		var yPos = 0;
		if (whichRow == 2){
			yPos+=6;
		}
		else if (whichRow == 3){
			yPos +=12;	
		}
		else if (whichRow == 4){
			yPos +=28;	
		}
		else if (whichRow == 5){
			yPos +=24;	
		}
		else if (whichRow == 6){
			yPos +=32;	
		}
		ig.game.spawnEntity( EntityRubble, this.pos.x, this.pos.y + yPos);	
		ig.game.spawnEntity( EntityRubble, this.pos.x + 6, this.pos.y + yPos);	
		ig.game.spawnEntity( EntityRubble, this.pos.x + 12, this.pos.y + yPos);	
		ig.game.spawnEntity( EntityRubble, this.pos.x + 18, this.pos.y + yPos);
		ig.game.spawnEntity( EntityRubble, this.pos.x + 24, this.pos.y + yPos);	
		ig.game.spawnEntity( EntityRubble, this.pos.x + 32, this.pos.y + yPos);	
	},
	getAnimType: function(min, max) {
		var randNum = Math.floor(Math.random() * (max - min) + min);
		this.animType = randNum;
	},
	receiveDamage( amount, from ){
		this.health -= amount;
		if (this.health <= 0 && !this.breaking){
			this.breaking = true;
			this.anims.breakMe.rewind();
			this.breakTimer.set(.2);
		}
	},
	update: function() {

		if (!this.setBricks && ig.game.collisionMap){
			this.setBricks = true;
			this.spawnCollisionTiles();
		}
		//Pause and Unpause
		if ( ig.game.pause && !this.pause ){
			this.paused();
		}
		else if (this.pause && !ig.game.pause){
			this.unpaused();	
		}
		
		this.animMe();
		
		if (this.breaking && this.breakTimer.delta() < 0.1 && this.rubbleSpawned != true){
			this.spawnRubble(1);
			this.spawnRubble(2);
			this.spawnRubble(3);
			this.spawnRubble(4);
			this.spawnRubble(5);
			this.spawnRubble(6);
			this.rubbleSpawned = true;
			ig.game.checkForOre();
		}
		if (this.breaking && this.breakTimer.delta() > 0){
			this.breakMe();
		}
		if (this.soundPlaying && this.soundPlayingTimer.delta() > 0){
			this.soundPlaying = false;
		}
		this.parent();
	},
	animMe: function(){
		if (this.broke){
			this.currentAnim = this.anims.breakMe;
		}
		else if (this.breaking){			
			this.currentAnim = this.anims.breakMe;		
		}
		else{
			if (this.health > 999){
				if (this.animType == 1){
					this.currentAnim = this.anims.bricka;	
				}
				else if (this.animType == 2){
					this.currentAnim = this.anims.brickb;
				}
				else if (this.animType == 3){
					this.currentAnim = this.anims.brickc;
				}
				else if (this.animType == 4){
					this.currentAnim = this.anims.brickd;
				}
				else if (this.animType == 5){
					this.currentAnim = this.anims.bricke;
				}
			}
			else if (this.health > 750){
				if (this.animType == 1){
					this.currentAnim = this.anims.hurt1a;	
				}
				else if (this.animType == 2){
					this.currentAnim = this.anims.hurt1b;
				}
				else if (this.animType == 3){
					this.currentAnim = this.anims.hurt1c;
				}
				else if (this.animType == 4){
					this.currentAnim = this.anims.hurt1d;
				}
				else if (this.animType == 5){
					this.currentAnim = this.anims.hurt1e;
				}
			}
			else if (this.health > 500){
				if (this.animType == 1){
					this.currentAnim = this.anims.hurt2a;	
				}
				else if (this.animType == 2){
					this.currentAnim = this.anims.hurt2b;
				}
				else if (this.animType == 3){
					this.currentAnim = this.anims.hurt2c;
				}	
				else if (this.animType == 4){
					this.currentAnim = this.anims.hurt2d;
				}
				else if (this.animType == 5){
					this.currentAnim = this.anims.hurt2e;
				}
			}
			else if (this.health > 250){
				if (this.animType == 1){
					this.currentAnim = this.anims.hurt3a;	
				}
				else if (this.animType == 2){
					this.currentAnim = this.anims.hurt3b;
				}	
				else if (this.animType == 3){
					this.currentAnim = this.anims.hurt3c;
				}
				else if (this.animType == 4){
					this.currentAnim = this.anims.hurt3d;
				}
				else if (this.animType == 5){
					this.currentAnim = this.anims.hurt3e;
				}
			}
			else if (this.health > 1){
				if (this.animType == 1){
					this.currentAnim = this.anims.hurt4a;	
				}
				else if (this.animType == 2){
					this.currentAnim = this.anims.hurt4b;
				}
				else if (this.animType == 3){
					this.currentAnim = this.anims.hurt4c;
				}
				else if (this.animType == 4){
					this.currentAnim = this.anims.hurt4d;
				}
				else if (this.animType == 5){
					this.currentAnim = this.anims.hurt4e;
				}
			}
		}
	},
	breakMe: function(){
		if (!ig.game.muteGame && !ig.game.levelBeat && !ig.game.transition&& !ig.game.deathScreen && !ig.game.dying){
			this.breakSound.volume = .05; 
			this.breakSound.play(); 
		}	
		this.broke = true;
		this.breaking = false;
		this.currentAnim = this.anims.breakMe.rewind();
		this.removeCollisionTiles();
		this.kill();
	},
	check: function( other ) {
		if (other.name == "pickaxe" && !this.breaking ){
			if (!ig.game.muteGame && !this.soundPlaying){
				this.soundPlaying = true;
				this.soundPlayingTimer.set(.25);
				this.crackSound.volume = .04; 
				this.crackSound.play(); 
			}
			this.receiveDamage(10, 'pickaxe');
		}		
	}
	
});


ig.EntityPool.enableFor( EntityMiningbrick );

});