<?php
	if (isset($_GET['wallet'])) {
		require_once($_SERVER['DOCUMENT_ROOT'] . '/code/php/mysql-connect.php');
		$wallet = $_GET['wallet'];
		$stmt = $my_Db_Connection->prepare("INSERT IGNORE INTO users (wallet) VALUES(:wallet)"); 			
		$stmt->bindParam(':wallet', $wallet);
		$stmt->execute();
		$my_Db_Connection = NULL;
	}
	else{
		die('hes ded');
	}
?>