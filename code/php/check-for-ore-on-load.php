<?php
	session_start();
	$result = 0;
	if ($_GET['wallet']){
		require_once($_SERVER['DOCUMENT_ROOT'] . '/code/php/mysql-connect.php');
		$wallet = $_GET['wallet'];
		$stmt = $my_Db_Connection->prepare("SELECT ore FROM users WHERE ( wallet = :wallet )"); 			
		$stmt->bindParam(':wallet', $wallet);
		$stmt->execute();
		$myResult = $stmt->fetchColumn();
		if ($myResult > 0){
			$result=$myResult;	
		}
		$my_Db_Connection = NULL;
	}
	echo $result;
?> 