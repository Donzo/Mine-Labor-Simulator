<?php
	//Get user account number, test ID, and pass percent (which is assigned when called)
	if (isset($_GET['wallet'])) {
		
		$walletAddress = $_GET['wallet'];
		$ore = NULL;
		
		require_once($_SERVER['DOCUMENT_ROOT'] . '/code/php/mysql-connect.php');
		
		/*
		
			$userAccount = $_GET['uAN'];
		$tstID = $_GET['tID'];
		$passPercent = $_GET['pp'];
		$myPercent = 0;
		*/
		
		
		$stmt = $my_Db_Connection->prepare("SELECT * FROM users WHERE wallet = :wallet"); 
		$stmt->bindParam(':wallet', $walletAddress);
		$stmt->execute();
		$returnThis = NULL;
		while ($row = $stmt->fetch()) {
			$ore = $row['ore'];
		}
		
		echo "my ore = " . $ore;
		$my_Db_Connection = NULL;
	}
	else{
		die('He dead, Jim.');
	}

	
?>