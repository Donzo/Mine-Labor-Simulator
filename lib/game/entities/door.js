ig.module(
	'game.entities.door'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
	
EntityDoor = ig.Entity.extend({
	size: {x: 30, y: 60},
	offset: {x: 0, y: 0},
	
	zIndex: 10,
	
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(255, 255, 255, 1)',
	_wmScalable: true,
	
	type: ig.Entity.TYPE.NONE, 
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.NONE,
	
	health: 9999999,
	speed: 0,
	
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
	},
	reset: function( x, y, settings ) {
		this.parent( x, y, settings );

	},
	update: function() {
		
		this.parent();
	},
	check: function( other ) {
		if (ig.game.getEntityByName('player') && ig.input.pressed('jump') && !ig.game.smeltShop){
			getOreBalance();
			ig.game.smeltShop = true;
			ig.game.confirmButtonsExist = true;
			ig.game.spawnEntity( EntityButton, 10, 10, {'name':'yesSmelt'});	
			ig.game.spawnEntity( EntityButton, 10, 10, {'name':'noSmelt'});	
			ig.game.spawnEntity( EntityButton, 10, 10, {'name':'exitSmelt'});
			console.log('spawned buttons');
			ig.game.textBox = true;
			ig.game.txtBoxTxt = "You have " + ig.game.pData.oreWalletBalance + " ORE in your wallet. Would you like to smelt them?";
			ig.game.txtBoxTxtSize = 2;
			ig.game.txtBoxHeight = .35;
		}
	}

});

	ig.EntityPool.enableFor( EntityDoor );
});