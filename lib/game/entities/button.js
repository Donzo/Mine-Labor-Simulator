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
		if (this.name == "mint"){
			this.size.x =  64;
			this.size.y =  64;
			this.pos.x =  14 + ig.game.screen.x;
			this.pos.y = 34 + ig.game.screen.y;
			//console.log('mint button exists and is located at ' + this.pos.x + " X, and " + this.pos.y + " Y.");
		}
		
		
		//Click me
		if (ig.input.released('click') && this.inFocus() && this.giveMeASecond.delta() > 0 && ig.game.getEntityByName('player') && !ig.game.socbClicked) {
			
			//Click Start Button
			if (this.name == "connect"){
				startTheGame();
			}
			if (this.name == "mint"){
				alert('mint');
				mintOre();
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