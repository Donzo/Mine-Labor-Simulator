<?php
	//Get user account number, test ID, and pass percent (which is assigned when called)
	if (isset($_GET['wallet']) && isset($_GET['tkn'])) {
		
		$isArray = true;
		$walletAddress = $_GET['wallet'];
		$userToken = $_GET['tkn'];
		$getuINT = false;
		if ($_GET['INT'] == true){
			$getuINT = true;
		}
		$ore = 0;
		$returnThis = NULL;
		
		require_once($_SERVER['DOCUMENT_ROOT'] . '/code/php/mysql-connect.php');
		
		/*
		
			$userAccount = $_GET['uAN'];
		$tstID = $_GET['tID'];
		$passPercent = $_GET['pp'];
		$myPercent = 0;
		*/
		$bool_value = NULL;
				
		$stmt = $my_Db_Connection->prepare("SELECT * FROM users WHERE wallet = :wallet AND tkn = :token"); 
		$stmt->bindParam(':wallet', $walletAddress);
		$stmt->bindParam(':token', $userToken);
		$stmt->execute();
		$returnThis = NULL;
		$ore = "0";
		
		while ($row = $stmt->fetch()) {
			$ore = $row['ore'];
		}
		
		if ($getuINT){
			$ore = intVal($ore);
			$returnThis = array('ore' => $ore);
		}
		else{
			$returnThis = array('ore' => $ore);
		}
		
		$myJSON = json_encode($returnThis);
		
		//Bracket for Fetch from Array
		if ($isArray){
			echo "[" . $myJSON . "]";
		}
		else{
			echo $myJSON;
		}	
		//Set Ore Count to Zero
		
		$stmt2 = $my_Db_Connection->prepare("UPDATE users SET ore = 0 WHERE wallet = :wallet AND tkn = :token"); 	
		$stmt2->bindParam(':wallet', $walletAddress);
		$stmt2->bindParam(':token', $userToken);
		$stmt2->execute();
		
		$my_Db_Connection = NULL;
	}
	else{
		die('He dead, Jim.');
	}

	
?>