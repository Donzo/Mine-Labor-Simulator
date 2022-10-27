<?php
	session_start();
	  
	++$_SESSION['rocksSmashed'];
	
	//This sets how easy or hard it is to find rocks.  
	$rockFindThresh = 98000;
	
	$randomNumber = (rand(1,100000));
	if ($randomNumber >$rockFindThresh){
		require_once($_SERVER['DOCUMENT_ROOT'] . '/code/php/mysql-connect.php');
		$wallet = $_GET['wallet'];
		$stmt = $my_Db_Connection->prepare("UPDATE users SET ore = ore + 1 WHERE wallet = :wallet"); 			
		$stmt->bindParam(':wallet', $wallet);
		$stmt->execute();
		$stmt2 = $my_Db_Connection->prepare("UPDATE users SET totalOre = totalOre + 1 WHERE wallet = :wallet"); 			
		$stmt2->bindParam(':wallet', $wallet);
		$stmt2->execute();
		$my_Db_Connection = NULL;
		echo "Found ore and stored it in DB";	
	}
	
?> 