<script>
function mintOre(){
						
			let web3 = new Web3(Web3.givenProvider);
			var contractAddress = '0x3Ec661189DfC6778e5a2940507406b0A59190d49';
			
			var contract = new web3.eth.Contract(abi1, contractAddress, {
				from: window['userAccountNumber'],
				//gasPrice: '20000000000'
			});
			
			//var metadataURI = "https://nftest.net" + pathToMyResults;
			
			contract.methods.requestOreCount(window['userAccountNumber']).send({
				queryAddress:window['userAccountNumber'],
			}, function(){
				/*var progressDiv = document.getElementById('progress-div');
				progressDiv.style.margin = ".25em";	
				progressDiv.style.textAlign = "center";	
				progressDiv.style.color = "#FAF566";	
				progressDiv.innerHTML = "Mining Transaction...";
				var loadWheel = document.getElementById('loading-wheel');
				loadWheel.style.display = "flex";
				document.getElementById('connection-in-progress').style.display = 'flex'; */
				console.log('mining transaction');
			})
			.on('receipt', function(receipt){
    			console.log('mined.');
    			/*/Loading wheel;
				var loadWheel = document.getElementById('loading-wheel');
				var progressDiv = document.getElementById('progress-div');
				progressDiv.style.margin = "1.5em 0em .25em 0em";
				progressDiv.style.color = "lime";	
				progressDiv.innerHTML = "NFT Minted!";
				loadWheel.style.display = 'flex';
				loadWheel.style.display.flexdirection = 'column';
				loadWheel.innerHTML = "<p style='text-align:center;'>Hash: </p><p><a href='" + blockExplorerBase + "" + receipt.transactionHash + "' target='_new'> "+ receipt.transactionHash + "</a></p>";
				*/	
			});
			
		}
</script>