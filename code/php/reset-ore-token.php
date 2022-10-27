<?php
	if (isset($_GET['wallet'])) {
		
		require_once($_SERVER['DOCUMENT_ROOT'] . '/code/php/mysql-connect.php');
		
		$token = (string)(rand(100000,10000000000000));
		$wallet = $_GET['wallet'];
		$stmt = $my_Db_Connection->prepare("UPDATE users SET tkn = :tokenStr WHERE ( wallet = :wallet )");
		$stmt->bindParam(':wallet', $wallet);
		$stmt->bindParam(':tokenStr', $token);	
		$stmt->execute();
		$my_Db_Connection = NULL;
		echo $token;
	}
	else{
		die('hes ded');
	}
?>