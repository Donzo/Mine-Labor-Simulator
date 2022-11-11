ig.module(
	'game.entities.button'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
	
EntityButton=ig.Entity.extend({
	size: {x: 1, y: 1},
	maxVel: {x: 000, y: 000},
	name: null,
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER,
	
	clicked: false,
	purpose: false,
	
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(245, 66, 212, 1)',
	
	//clickSound: new ig.Sound( 'media/sounds/new-game.*' ),
	
	init: function( x, y, settings ) {
		this.parent(x, y, settings);	
		this.giveMeASecond = new ig.Timer(.33);
	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.giveMeASecond.set(.33);
		this.clicked = false;
    },
	
	update: function() {
		if (this.name == "connect"){
			this.size.x =  ig.game.conButWidth ;
			this.size.y =  ig.game.conButHeight; 
			this.pos.x = ig.game.screen.x + ig.game.conButX;
			this.pos.y = ig.game.screen.y + ig.game.conButY;
			
			if (!ig.game.titleScreen){
				this.kill();
			}
			//console.log('connect button exists and is located at ' + this.pos.x + " X, and " + this.pos.y + " Y.");

		}
		else if (this.name == "mint"){
			this.size.x =  64;
			this.size.y =  64;
			this.pos.x =  14 + ig.game.screen.x;
			this.pos.y = 34 + ig.game.screen.y;
			//console.log('mint button exists and is located at ' + this.pos.x + " X, and " + this.pos.y + " Y.");
		}
		else if (this.name == "confirmY"){
			this.size.x =  ig.game.confirmButWidth;
			this.size.y =  ig.game.confirmButHeight;
			this.pos.x =  ig.game.confirmBut1X + ig.game.screen.x;
			this.pos.y = ig.game.confirmButY + ig.game.screen.y;
			if (ig.game.confirmButtonsExist == false){
				this.kill();
			}
			//console.log('confirmY button exists and is located at ' + this.pos.x + " X, and " + this.pos.y + " Y.");
		}
		else if (this.name == "confirmN"){
			this.size.x =  ig.game.confirmButWidth;
			this.size.y =  ig.game.confirmButHeight;
			this.pos.x =  ig.game.confirmBut2X + ig.game.screen.x;
			this.pos.y = ig.game.confirmButY + ig.game.screen.y;
			if (ig.game.confirmButtonsExist == false){
				this.kill();
			}
			//console.log('confirmY button exists and is located at ' + this.pos.x + " X, and " + this.pos.y + " Y.");
		}
		else if (this.name == "yesSmelt"){
			this.size.x =  ig.game.confirmButWidth;
			this.size.y =  ig.game.confirmButHeight;
			this.pos.x =  ig.game.confirmBut1X + ig.game.screen.x;
			this.pos.y = ig.game.confirmButY + ig.game.screen.y;
			if (ig.game.smeltShop == false){
				this.kill();
			}
		}
		else if (this.name == "noSmelt"){
			this.size.x =  ig.game.confirmButWidth;
			this.size.y =  ig.game.confirmButHeight;
			this.pos.x =  ig.game.confirmBut2X + ig.game.screen.x;
			this.pos.y = ig.game.confirmButY + ig.game.screen.y;
			if (ig.game.smeltShop == false){
				ig.game.confirmButtonsExist = false;
				this.kill();
			}
		}
		else if (this.name == "exitSmelt"){
			this.pos.x= ig.system.width * .65 + ig.game.screen.x;
			this.pos.y  = ig.system.height * .8 + ig.game.screen.y;
			this.size.x = ig.system.width * .35;
			this.size.y = ig.system.height * .2;
			if (ig.game.smeltShop == false){
				ig.game.confirmButtonsExist = false;
				this.kill();
			}
		}
		
		
		//Click me
		if (ig.input.released('click') && this.inFocus() && this.giveMeASecond.delta() > 0 && ig.game.getEntityByName('player') && !ig.game.socbClicked) {
			
			//Click Start Button
			if (this.name == "connect"){
				startTheGame();
			}
			else if (this.name == "mint"){
				ig.game.textBox = true;
				ig.game.txtBoxTxt = "You have collected " + ig.game.pData.ore + " ORE. Would you like to extract them to your wallet?";
				ig.game.txtBoxTxtSize = 2;
				ig.game.txtBoxHeight = .35;
				if (!ig.game.confirmButtonsExist){
					ig.game.confirmButtonsExist = true;
					ig.game.spawnEntity( EntityButton, 10, 10, {'name':'confirmY', 'purpose':'minting'});
					ig.game.spawnEntity( EntityButton, 10, 10, {'name':'confirmN', 'purpose':'minting'});	
				}
			}
			else if (this.name == "confirmY"){
				ig.game.txtBoxTxt = "Approve this transaction to MINT your ORE tokens.";
				prepareMint();
				ig.game.confirmButtonsExist = false;
				//ig.game.textBox = false;
			}
			else if (this.name == "confirmN"){
				refreshToken();
				ig.game.confirmButtonsExist = false;
				ig.game.textBox = false;
			}
			else if (this.name == "yesSmelt"){
				smeltMyOre();
			}
			else if (this.name == "noSmelt"){
				ig.game.textBox = false;
				ig.game.smeltShop = false;
			}
			else if (this.name == "exitSmelt"){
				ig.game.textBox = false;
				ig.game.smeltShop = false;
			}
			

		}
		this.parent();
	},

	kill: function(){
		this.parent();
	},
	inFocus: function() {
    return (
       (this.pos.x <= (ig.input.mouse.x + ig.game.screen.x)) &&
       ((ig.input.mouse.x + ig.game.screen.x) <= this.pos.x + this.size.x) &&
       (this.pos.y <= (ig.input.mouse.y + ig.game.screen.y)) &&
       ((ig.input.mouse.y + ig.game.screen.y) <= this.pos.y + this.size.y)
    );
 	}
		
});
ig.EntityPool.enableFor( EntityButton );
});