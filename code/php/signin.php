<?php
	if (isset($_GET['wallet'])) {
		
		require_once($_SERVER['DOCUMENT_ROOT'] . '/code/php/mysql-connect.php');
		
		$token = (string)(rand(100000,10000000000000));
		$wallet = $_GET['wallet'];
		$stmt = $my_Db_Connection->prepare("INSERT IGNORE INTO users (wallet) VALUES(:wallet)");
		$stmt->bindParam(':wallet', $wallet);
		$stmt->execute();
		$stmt2 = $my_Db_Connection->prepare("UPDATE users SET tkn = :tokenStr WHERE ( wallet = :wallet )");
		$stmt2->bindParam(':wallet', $wallet);
		$stmt2->bindParam(':tokenStr', $token);	
		$stmt2->execute();
		//$stmt2 = $my_Db_Connection->prepare("UPDATE users SET tkn = ore + 1 WHERE ( wallet = :wallet )"); 		
		$my_Db_Connection = NULL;
		echo $wallet . " added to DB or is already in DB and set token t0 " . $token;
	}
	else{
		die('hes ded');
	}
?>