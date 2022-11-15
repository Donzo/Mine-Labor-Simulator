<?php
	//Start the session
	session_start();
?>
<!DOCTYPE html>
<html>
<head>
	<title>Mine Labor Simulator</title>
	
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
	</style>
	<style type="text/css">
	/* press-start-2p-regular - latin */
		@font-face {
			font-family: 'Press Start 2P';
			font-style: normal;
			font-weight: 400;
			src: url('/font/press-start-2p-v14-latin-regular.eot'); /* IE9 Compat Modes */
			src: local(''),
				url('/font/press-start-2p-v14-latin-regular.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
				url('/font/press-start-2p-v14-latin-regular.woff2') format('woff2'), /* Super Modern Browsers */
				url('/font/press-start-2p-v14-latin-regular.woff') format('woff'), /* Modern Browsers */
				url('/font/press-start-2p-v14-latin-regular.ttf') format('truetype'), /* Safari, Android, iOS */
				url('/font/press-start-2p-v14-latin-regular.svg#PressStart2P') format('svg'); /* Legacy iOS */
		}
		html,body {
			background-color: #333;
			color: #fff;
			font-family: 'Press Start 2P', cursive;
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
	
	<link rel="shortcut icon" href="https://minelaborsimulator.com/favicon.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
	<link rel="manifest" href="/site.webmanifest">
	

	
	
	<script type="text/javascript">
		/*Preload Title Screen Images*/
		var tsImage = new Image();
		tsImage.src = 'media/buttons-and-logos/logo.png';
		var conBut = new Image();
		conBut.src = 'media/buttons-and-logos/connect-button.png';
		
		var smeltShopInside = new Image();
		smeltShopInside.src = 'media/smelt-shop-inside.png';
		
		var storeInside = new Image();
		storeInside.src = 'media/store-inside.png';
		
		function startTheGame(){
			connectWallet();
			//ig.game.startGame();
		}
		window['userAccountNumber'] = false;
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
<?php require_once($_SERVER['DOCUMENT_ROOT'] . '/code/js/mint-ore.php'); ?>
<?php require_once($_SERVER['DOCUMENT_ROOT'] . '/code/js/abi1.php'); ?>
<?php require_once($_SERVER['DOCUMENT_ROOT'] . '/code/js/abi2.php'); ?>
<?php require_once($_SERVER['DOCUMENT_ROOT'] . '/code/js/abi3.php'); ?>
<?php require_once($_SERVER['DOCUMENT_ROOT'] . '/code/js/abi4.php'); ?>
<?php require_once($_SERVER['DOCUMENT_ROOT'] . '/code/js/abi5.php'); ?>
<?php require_once($_SERVER['DOCUMENT_ROOT'] . '/code/js/smelt-ore.php'); ?>
<?php require_once($_SERVER['DOCUMENT_ROOT'] . '/code/js/make-item.php'); ?>
</html>