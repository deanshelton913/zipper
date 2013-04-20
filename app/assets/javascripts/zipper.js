var bats_api_base_url = '/bats_api.json',
		bats_start_resource = '/startBats',
		bats_stop_resource = '/startBats',
		poll_frequency = 10, // ms
		stop_on_error = true;


// BATS Controller.
function bats($scope, $http, $timeout){


	$scope.connectable_bats = function(){
		var connected_bats = [];
		angular.forEach($scope.zipper.connObjectList, function(obj, i){
			if(obj.deviceType === "BATS" && obj.connected === true){
				connected_bats.push(obj);
			}
		});
		return connected_bats;
	}
	$scope.uncacheableURI = function(url){
		return url + '?nocache=' + new Date().getTime();
	}

	$scope.clickForceBATS = function(){
		bats_nocache_url = $scope.uncacheableURI(bats_api_base_url + bats_start_resource);
		$http({method:'GET',url:bats_nocache_url}).
		success(function(data, status, headers, config) {
			
		}).
		error(function(data, status, headers, config) {
	    flashError('error', '<h2>There was an error contactinf the bats resource.</h2>URI we used to retrieve the resources: '+bats_nocache_url+'<br/>What was received from the server: '+ data)
	  });
	}
	
	$scope.disableWifiButton = function(){
		if($scope.zipper !== undefined){
			if ($scope.zipper.usingBATS === false){
				if($scope.connectable_bats().length > 0){
					if($scope.zipper.whenCanUserInteract < new Date().getTime()){
						return false; // ENABLED
					}
				}
			}
		}
		return true; // DISABLED
	}

	$scope.disableVSATButton = function(){
		if($scope.zipper !== undefined){
			if ($scope.zipper.usingBATS === true){
				if($scope.zipper.whenCanUserInteract < new Date().getTime()){
					return false; // ENABLED
				}
			}
		}
		return true; // DISABLED
	}


	$scope.servinng_ip_via = function(){
		if($scope.zipper !== undefined){
			return ($scope.zipper.usingBATS === true ? 'BATS' : 'vSAT');
		}
	}



	$scope.poll = function(){
		bats_nocache_url = $scope.uncacheableURI(bats_api_base_url);
    $http({method: 'GET', url: bats_nocache_url}).
		success(function(data, status, headers, config) {
			preProcessCheck(data);
		  $scope.zipper = data;
		  mytimeout = $timeout($scope.poll, poll_frequency); // recurse.
		}).
		error(function(data, status, headers, config) {
	    flashError('error', '<h2>There was an error contacting the BATS resources</h2>URI we used to retrieve the resources: '+bats_nocache_url+'<br/>What was received from the server: '+ data)
	  });
  }
  var mytimeout = $timeout($scope.poll, poll_frequency);
}


function preProcessCheck(data){
	var date = new Date(),
		timestamp = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

	if(data.connObjectList.length < 1){
		flashError('error','<h2>ERROR</h2>List of connected objects is empty. (' + timestamp + ')' );
	}
	if(data.usingBATS === undefined){
		flashError('error','<h2>ERROR</h2>usingBATS key is not present in JSON. (' + timestamp + ')' );
	}
	if(data.whenCanUserInteract === undefined){
		flashError('error','<h2>ERROR</h2>whenCanUserInteract key is not present in JSON. (' + timestamp + ')' );
	}
	$.each(data.connObjectList, function(i,obj){
		if(obj.deviceType === undefined){
			flashError('error','<h2>ERROR</h2>deviceType is not present in JSON. (' + timestamp + ')');
		}
		if(obj.deviceName === undefined){
			flashError('error','<h2>ERROR</h2>deviceName is not present in JSON. (' + timestamp + ')');
		}
		if(obj.connected === undefined){
			flashError('error','<h2>ERROR</h2>connected key is not present in JSON. (' + timestamp + ')');
		}
	});
	
}
function flashError(status,msg){
	$('#errors').html('<div class="alert alert-'+status+'">'+msg+'</div>');
}

