ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.debug.debug',
	'impact.font',
	'plugins.camera',
	'plugins.touch-button',
	'game.entities.button',
	'game.entities.crumblebrick',
	'game.entities.girder',
	'game.entities.goal',
	'game.entities.hawklauncher',
	'game.entities.ladder',
	'game.entities.miningbrick',
	'game.entities.monkey',
	'game.entities.mutebutton',
	'game.entities.player',
	'game.entities.rockdumper',
	'game.entities.sinkblock',
	'game.entities.snowmonster',
	'game.entities.spikes',
	'game.entities.spring',
	'game.entities.token',
	'game.levels.l1'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	gravity: 2000,
	pause: true,
	titleScreen: true,
	tsbgColor: "#FFCB9A",

	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	
	//In Game Variables
	ladderCount: 0,
	girderCount: 0,
	springCount: 0,
	monkeyCount: 0,
	hawkLauncherCount: 0,
	sinkBlockCount: 0,
	hawkCount: 0,
	snowMonsterCount: 0,
	playerOnSpikes: false,
	shortSpringTime: .25,
	longSpringTime: .5,
	sightTime: .5,
	lastSawPlayerTimerDefault: 3,
	enemyRecoveryTime: .66,

	//Button Images
	buttonLeft: new ig.Image( 'media/buttons-and-logos/button-left.png' ),
	buttonRight: new ig.Image( 'media/buttons-and-logos/button-right.png' ),
	buttonJump: new ig.Image( 'media/buttons-and-logos/button-jump.png' ),
	buttonA: new ig.Image( 'media/buttons-and-logos/button-a.png' ),

	//Small Buttons
	buttonLeftSmall: new ig.Image( 'media/buttons-and-logos/button-left-small.png' ),
	buttonRightSmall: new ig.Image( 'media/buttons-and-logos/button-right-small.png' ),
	buttonJumpSmall: new ig.Image( 'media/buttons-and-logos/button-jump-small.png' ),
	buttonASmall: new ig.Image( 'media/buttons-and-logos/button-a-small.png' ),
	
	//Smaller Buttons
	buttonLeftSmaller: new ig.Image( 'media/buttons-and-logos/button-left-smaller.png' ),
	buttonRightSmaller: new ig.Image( 'media/buttons-and-logos/button-right-smaller.png' ),
	buttonJumpSmaller: new ig.Image( 'media/buttons-and-logos/button-jump-smaller.png' ),
	buttonASmaller: new ig.Image( 'media/buttons-and-logos/button-a-smaller.png' ),
	
	//Mute Buttons
	buttonMute: new ig.Image( 'media/buttons-and-logos/button-mute.png' ),
	buttonMuted: new ig.Image( 'media/buttons-and-logos/button-muted.png' ),
	buttonMuteSmall: new ig.Image( 'media/buttons-and-logos/button-mute-small.png' ),
	buttonMutedSmall: new ig.Image( 'media/buttons-and-logos/button-muted-small.png' ),

	muteGame: false,
	musicLevel: 1,

	//Preloaded Songs
	songs: {
		l1: new ig.Sound('media/music/tree-beat.*', false )
	},

	deadSound: new ig.Sound( 'media/music/dead-climber.*' ),
	victorySound: new ig.Sound('media/sounds/victory-sound-02.*'),
	youWinSound: new ig.Sound('media/sounds/you-win.*'),
	hitSound: new ig.Sound( 'media/sounds/hit.*' ),
	birdAttackSound: new ig.Sound( 'media/sounds/bird-attack.*' ),
	birdDeadSound: new ig.Sound( 'media/sounds/bird-dead.*' ),
	monkeyAttackSound: new ig.Sound( 'media/sounds/monkey-attack.*' ),
	monkeyDeadSound: new ig.Sound( 'media/sounds/monkey-dead.*' ),
	wallGrabSound: new ig.Sound( 'media/sounds/wall-grab.*' ),
	wallJumpSound: new ig.Sound( 'media/sounds/jump.*' ),
	jumpSound: new ig.Sound( 'media/sounds/jump-03.*' ),
	pickaxeSound: new ig.Sound( 'media/sounds/pick-axe-02.*' ),
	snowMonsterAttackSound: new ig.Sound( 'media/sounds/snow-monster-attack.*' ),
	snowMonsterDeadSound: new ig.Sound( 'media/sounds/snow-monster-dead.*' ),
	snowballSound: new ig.Sound( 'media/sounds/snowball.*' ),
	snowballMissSound: new ig.Sound( 'media/sounds/snowball-miss.*' ),
	snowballHitSound: new ig.Sound( 'media/sounds/snowball-hit.*' ),
	deathSound: new ig.Sound( 'media/sounds/death-noise.*' ),
	rockHitSound: new ig.Sound( 'media/sounds/rock-hit.*' ),
	girderCrushSound: new ig.Sound( 'media/sounds/girder-crush.*'),
	bounceSound: new ig.Sound( 'media/sounds/spring-02.*' ),
    superBounceSound: new ig.Sound( 'media/sounds/spring-01.*' ),
	landSound: new ig.Sound( 'media/sounds/land-03.*' ),
	
	init: function() {
		//Bind Inputs
		ig.input.bind(ig.KEY.MOUSE1, 'click');
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.UP_ARROW, 'jump' );
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
		ig.input.bind( ig.KEY.SPACE, 'action' );

		//Load Title Screen images into impact
		this.loadTSImages();

		this.loadLevel( LevelL1 );

		ig.game.spawnEntity( EntityButton, 10, 10, {'name':'connect'});	

		ig.music.add (this.songs.l1, 01, ["l1"] );
		ig.music.loop = true;
		ig.music.volume = this.musicLevel;	


		//Set Buttons
		ig.game.setButtons();
		
		if( ig.ua.mobile ) {
			this.amImobile = true;
		}
		else{
			this.amImobile = false;
		}
		

		//Instantiate Camera
		this.setupCamera();


	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		if (ig.game.getEntityByName('player')){
			var player = ig.game.getEntityByName('player');
			
			//Camera Follow
			if (!this.quiz){
				this.camera.follow( this.player );
			}
		}


	},
	startGame: function(){
		ig.game.titleScreen = false;
		ig.game.pause = false;
	},
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		//Draw Buttons on Mobile
		if( this.buttonSet) {
        	this.buttonSet.draw(); 
		}
		
		this.drawMuteButton();

		if (this.titleScreen){
			this.drawTitleScreen();
		}
		if (ig.game.accountNum){
			this.font.draw( ig.game.accountNum, 10, 20, ig.Font.ALIGN.LEFT );

		}
	},

	spawnButtons: function(){
		//Spawn mute button if not in worldmaker
		if( !ig.game.muteButtonAlive ) { 
			ig.game.spawnEntity( EntityMutebutton, 0, 0);	
		}
	},
	pData: {
		"tokens":0,
		//Level Total
		"tokensLT":0,
		//Game Total
		"tokensGT":0,
		"lvl":1,
		"deaths":0,
	},
	loadTSImages: function(){
		this.tsImage = new Image();
		this.tsImage.src = window.tsImage.src;
		this.conButImg = new Image();
		this.conButImg.src = window.conBut.src;
	},
	drawTitleScreen: function(){
		var ctx = ig.system.context;
		var tsHeight = ig.system.height * .6;
		var tsWidth = tsHeight;
		
		var tsImageX = ig.system.width / 2 - (tsWidth / 2);
		var tsImageY = ig.system.height * .1;

		this.conButWidth = tsWidth * .5;
		this.conButHeight = this.conButWidth / 2;
		this.conButX = ig.system.width / 2 - (this.conButWidth / 2);
		this.conButY = tsImageY + tsHeight + 20;
		

		this.drawABox(0, ig.system.width, 0, ig.system.height, 0, this.tsbgColor, true, this.tsbgColor);		
		ctx.drawImage(this.tsImage, tsImageX, tsImageY, tsWidth, tsHeight );
		ctx.drawImage(this.conButImg, this.conButX, this.conButY, this.conButWidth, this.conButHeight );
		
	
		//this.font.draw( 'Click Anywhere to Connect Your Wallet!', x, y, ig.Font.ALIGN.CENTER );
	},
	playMusicBro: function(){
		this.songs.l1.loop = true;
		this.songs.l1.volume = .25;
		this.songs.l1.play();
		
		if (!ig.game.muteGame){
			ig.music.volume = ig.game.musicLevel;
		}
		else{
			ig.music.volume = 0;
		}
	},
	setupCamera: function() {
		// Set up the camera. The camera's center is at a third of the screen
		// size, i.e. somewhat shift left and up. Damping is set to 3px.		
		this.camera = new Camera( ig.system.width/2.15, ig.system.height/3, 5 );		
		this.camera.trap.size.x = ig.system.width/10;
    		this.camera.trap.size.y = ig.system.height/5;
    		this.camera.lookAhead.x = ig.ua.mobile ? ig.system.width/6 : 0;
		
		// Set camera's screen bounds and reposition the trap on the player
    		this.camera.max.x = this.collisionMap.pxWidth - ig.system.width;
    		this.camera.max.y = this.collisionMap.pxHeight - ig.system.height;
		if (ig.game.getEntityByName('fish')){
			var player = ig.game.getEntityByName('fish');
			this.camera.set( player );	
		}
	},
	drawMuteButton: function(){
		var bRight = ig.system.width - 84;
		var bTop = 10;
			
		if (this.muteGame){
			if ( window.scale < .7){
				bRight = ig.system.width - 52;
				this.buttonMuted.draw(bRight, bTop);		
			}
			else{
				this.buttonMutedSmall.draw(bRight, bTop);		
			}
		}
		else{
			if ( window.scale < .7){
				bRight = ig.system.width - 52;
				this.buttonMute.draw(bRight, bTop);	
			}
			else{
				this.buttonMuteSmall.draw(bRight, bTop);	
			}
		}
	},
	checkForOre: function(){
		//alert('check for ore!');
		
		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
    		if( request.readyState == request.DONE && request.status == 200 ) {
       			//console.log( 'server', request.getResponseHeader('server') );
				console.log( request.responseText );
			}
			
		};
		request.open('GET', 'https://minelaborsimulator.com/code/php/check-for-ore.php?wallet=' + window['userAccountNumber']);
		request.send();
	},
	setButtons: function(){
		//Buttons for Mobile
		 if( ig.ua.mobile ) {
			var buttonSizeY = null;
			var buttonPosY = null;
			var butRightX = null;
			var buttonRight = null;
			
			//Wide Screen - Regular Buttons
			if ( window.innerWidth >550){
				butRightX = ig.system.width - 106;
				buttonRight = ig.system.width;
				this.buttonSet = new ig.TouchButtonCollection([
					new ig.TouchButton( 'left', {left: 10, bottom: 10}, 96, 96, this.buttonLeft, 0 ),
					new ig.TouchButton( 'right', {left: 120, bottom: 10}, 96, 96, this.buttonRight, 0 ),
					new ig.TouchButton( 'jump', {left: butRightX, bottom: 10}, 96, 96, this.buttonJump, 0 ),
					new ig.TouchButton( 'action', {left: butRightX - 106, bottom: 10}, 96, 96, this.buttonA, 0 ),
				]);
			}
			//Small Size Buttons
			else if ( window.innerWidth >440){
				butRightX = ig.system.width - 90;
				buttonRight = ig.system.width;
				this.buttonSet = new ig.TouchButtonCollection([
					new ig.TouchButton( 'left', {left: 10, bottom: 10}, 80, 80, this.buttonLeftSmall, 0 ),
					new ig.TouchButton( 'right', {left: 100, bottom: 10}, 80, 80, this.buttonRightSmall, 0 ),
					new ig.TouchButton( 'jump', {left: butRightX, bottom: 10}, 80, 80, this.buttonJumpSmall, 0 ),
					new ig.TouchButton( 'action', {left: butRightX - 90, bottom: 10}, 80, 80, this.buttonASmall, 0 ),
				]);
			}
			//Smaller Size Buttons
			else{
				butRightX = ig.system.width - 70;
				buttonRight = ig.system.width;
				this.buttonSet = new ig.TouchButtonCollection([
					new ig.TouchButton( 'left', {left: 10, bottom: 10}, 60, 60, this.buttonLeftSmaller, 0 ),
					new ig.TouchButton( 'right', {left: 80, bottom: 10}, 60, 60, this.buttonRightSmaller, 0 ),
					new ig.TouchButton( 'jump', {left: butRightX, bottom: 10}, 60, 60, this.buttonJumpSmaller, 0 ),
					new ig.TouchButton( 'action', {left: butRightX - 70, bottom: 10}, 60, 60, this.buttonASmaller, 0 ),
				]);
			}

			this.buttonSet.align();
		}
	},

	drawABox: function(lx, rx, ty, by, lineWidth, lineColor, fill, fillcolor){
		var ctx = ig.system.context;
		ctx.beginPath();	
		
		ctx.moveTo(lx, ty);
		ctx.lineTo(rx, ty);
		ctx.lineTo(rx, by);
		ctx.lineTo(lx, by);
		ctx.lineTo(lx, ty);
		
		ctx.closePath();
		
		if(lineWidth){
			ctx.lineWidth = lineWidth;
		}
		if (lineColor){
			ctx.strokeStyle = lineColor;
		}
		
		ctx.stroke();
		
		if (fillcolor){
			ig.system.context.fillStyle = fillcolor;
		}
		if (fill == true){
			ctx.fill();	
		}
	},

	//Sounds
	landNoise: function(){
		if (!ig.game.muteGame){
			ig.game.landSound.volume = .075;
			ig.game.landSound.play();
		}	
	},
	pickAxeSwingNoise: function(){
		if (!ig.game.muteGame){
			ig.game.pickaxeSound.volume = .1;	
			ig.game.pickaxeSound.play();
		}	
	},
	girderCrushNoise: function(){
		if (!ig.game.muteGame){
			ig.game.girderCrushSound.volume = .15;
			ig.game.girderCrushSound.play();
		}	
	},
	deathNoise: function(){
		if (!ig.game.muteGame){
			ig.game.deathSound.volume = .1;
			ig.game.deathSound.play();
		}	
	},
	rockHitNoise: function(){
		if (!ig.game.muteGame){
			ig.game.rockHitSound.volume = .1;
			ig.game.rockHitSound.play();
		}	
	},
	snowMonsterAttackNoise: function(){
		if (!ig.game.muteGame){
			ig.game.snowMonsterAttackSound.volume = .2;
			ig.game.snowMonsterAttackSound.play();
		}	
	},
	snowMonsterDeadNoise: function(){
		if (!ig.game.muteGame){
			ig.game.snowMonsterDeadSound.volume = .2;
			ig.game.snowMonsterDeadSound.play();
		}	
	},
	snowballNoise: function(){
		if (!ig.game.muteGame){
			ig.game.snowballSound.volume = .15;
			ig.game.snowballSound.play();
		}	
	},
	snowballMissNoise: function(){
		if (!ig.game.muteGame){
			ig.game.snowballMissSound.volume = .15;
			ig.game.snowballMissSound.play();
		}	
	},
	snowballHitNoise: function(){
		if (!ig.game.muteGame){
			ig.game.snowballHitSound.volume = .15;
			ig.game.snowballHitSound.play();
		}	
	},
	birdAttackNoise: function(){
		if (!ig.game.muteGame){
			ig.game.birdAttackSound.volume = .2;
			ig.game.birdAttackSound.play();
		}	
	},
	birdDeadNoise: function(){
		if (!ig.game.muteGame){
			ig.game.birdDeadSound.volume = .2;
			ig.game.birdDeadSound.play();
		}	
	},
	monkeyAttackNoise: function(){
		if (!ig.game.muteGame){
			ig.game.monkeyAttackSound.volume = .2;
			ig.game.monkeyAttackSound.play();
		}	
	},
	monkeyDeadNoise: function(){
		if (!ig.game.muteGame){
			ig.game.monkeyDeadSound.volume = .1;
			ig.game.monkeyDeadSound.play();
		}	
	},
	pickAxeNoise: function(){
		if (!ig.game.muteGame){
			ig.game.hitSound.volume = .085;
			ig.game.hitSound.play();
		}
	},
	wallJumpNoise: function(){
		if (!ig.game.muteGame){
			ig.game.wallJumpSound.volume = .065;
			ig.game.wallJumpSound.play();
		}
	},
	jumpNoise: function(){
		if (!ig.game.muteGame){
			ig.game.jumpSound.volume = .15;
			ig.game.jumpSound.play();
		}
	},
	wallGrabNoise: function(){
		if (!ig.game.muteGame){
			ig.game.wallGrabSound.volume = .125;
			ig.game.wallGrabSound.play();
		}
	},
	bounceNoise: function(){
		if (!ig.game.muteGame && ig.game.springSound != true){
			this.superBounceSound.volume = .1;
			this.superBounceSound.play();
			ig.game.springSound = true;
		}
	},
	superBounceNoise: function(){
		if (!ig.game.muteGame && ig.game.springSound != true){
			this.bounceSound.volume = .09;
			this.bounceSound.play();
			ig.game.springSound = true;
		}
	},
	
	resizeYo: function(){
		//Set Canvas Width Minus Ads
		this.cWidth = window.innerWidth;
		this.cHeight = window.innerHeight;
		
		// Resize the canvas style and tell Impact to resize the canvas itself;
		canvas.style.width = this.cWidth + 'px';
		canvas.style.height = this.cHeight + 'px';

		var scale = .5;

		ig.system.resize( this.cWidth * scale, this.cHeight * scale);

		// Re-center the camera - it's dependend on the screen size.
		if( ig.game && ig.game.setupCamera ) {
			//SET CAMERA
			ig.game.setupCamera();
		}
		//DON'T FORGET TO SET BUTTONS TOO	
		ig.game.setButtons();
	}

	
});


var scale = .5;

//Scale the Canvas to the Screen
canvas.style.width = window.innerWidth + 'px';
canvas.style.height =window.innerHeight+ 'px';

window.addEventListener('resize', function(){

	// If the game hasn't started yet, there's nothing to do here
	if( !ig.system ) { return; }
		if (ig.game){
			ig.game.resizeYo();
		}
	}, false);

// Resize the canvas style and tell Impact to resize the canvas itself;
var width = window.innerWidth * scale,
height = window.innerHeight * scale;
ig.main( '#canvas', MyGame, 60, width, height, 1 );

});
