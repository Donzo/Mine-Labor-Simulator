<?php
	//Start the session
	session_start();
?>
<!DOCTYPE html>
<html>
<head>
	<title>Mine Labor Simulator</title>
	<style type="text/css">
		html,body {
			background-color: #333;
			color: #fff;
			font-family: helvetica, arial, sans-serif;
			margin: 0;
			padding: 0;
			font-size: 12pt;
		}
		
		#canvas {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			margin: auto;
		}
	</style>
	
	<script type="text/javascript">
		/*Preload Title Screen Images*/
		var tsImage = new Image();
		tsImage.src = 'media/buttons-and-logos/logo.png';
		var conBut = new Image();
		conBut.src = 'media/buttons-and-logos/connect-button.png';
		
		function startTheGame(){
			connectWallet();
			//ig.game.startGame();
		}
		
	</script>
	
	<script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>
	
	<script type="text/javascript" src="lib/impact/impact.js"></script>
	<script type="text/javascript" src="lib/game/main.js"></script>
	
</head>
<body>
	<?php
		$_SESSION["rocksSmashed"] = 0;
		$_SESSION["oresFound"] = 0;
	?>
	<canvas id="canvas"></canvas>
</body>
<?php require_once($_SERVER['DOCUMENT_ROOT'] . '/code/js/connect-wallet.php'); ?>
</html>
