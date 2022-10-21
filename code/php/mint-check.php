<?php
	//Get user account number, test ID, and pass percent (which is assigned when called)
	if (isset($_GET['wallet'])) {
		
		$walletAddress = $_GET['wallet'];
		$getuINT = false;
		if ($_GET['uINT'] == true){
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
				
		$stmt = $my_Db_Connection->prepare("SELECT * FROM users WHERE wallet = :wallet"); 
		$stmt->bindParam(':wallet', $walletAddress);
		$stmt->execute();
		$returnThis = NULL;
		$ore = "0";
		
		while ($row = $stmt->fetch()) {
			$ore = $row['ore'];
		}
		
		if ($getuINT){
			$ore = (int)$ore;
			$returnThis = array('ore' => $ore);
		}
		else{
			$returnThis = array('ore' => $ore);
		}
		
		$myJSON = json_encode($returnThis);
		echo $myJSON;
		$my_Db_Connection = NULL;
	}
	else{
		die('He dead, Jim.');
	}

	
?>