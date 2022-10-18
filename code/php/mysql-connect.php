<?php 
	$my_Db_Connection = NULL;
	/*DB Credentials*/
	$database = 'dbs8891849';
	$password = '7!*d8JqpToTE4i';
	$servername = 'db5010499726.hosting-data.io';
	$username = 'dbu933703';
	$sql = "mysql:host=$servername;dbname=$database;";
		
	$dsn_Options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION];
	
	try { 
  		$my_Db_Connection = new PDO($sql, $username, $password, $dsn_Options);
  		//echo "Connected successfully";
	} 
	catch (PDOException $error) {
  		echo 'Connection error: ' . $error->getMessage();
	}
