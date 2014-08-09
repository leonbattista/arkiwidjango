app.controller('ProjectsCtrl', function($scope, $http, Projects) {

	$scope.projects = Projects.getProjects();
	$scope.noResult = Projects.givesNoResult();
		
	function updateProjects(newValue, oldValue) {
		$scope.projects = newValue;		
		$scope.noResult = Projects.givesNoResult();
	}
	
	$scope.$watch(Projects.getProjects, updateProjects);	
	
});

app.controller('ProjectDetailCtrl',function($scope, $routeParams, $modal, $http, Restangular) {

	// **** GOOGLE MAP ****

	angular.extend($scope, {

		map: {
			control: {},
			markersControl: {},
			refresh: true,
			center: {
				latitude: 0,
				longitude: 0
			},
			zoom: 15,
			bounds: {},
			dragging: false,
			options: {},
			events: {},
			marker: {
				control: {},
				id: 1,
				coords: {
					latitude: 0,
					longitude: 0
				},
				showWindow: false,
				options: {
					title: "hello"
				}
			}
		}
	});
	 	
	google.maps.visualRefresh = true;
	 
	$scope.map.events = {
		tilesloaded: function (map) {
			$scope.$apply(function () {
				$scope.mapInstance = map;
			});
		}
	};

	$http.get('api/projects/' + $routeParams.projectId + '/').success(function(data) {
		
		$scope.project = data;
		$scope.hasPubDate = Boolean(data.pub_date != '');
		$scope.map.center.latitude = $scope.project.latitude;
		$scope.map.center.longitude = $scope.project.longitude;
		$scope.map.marker.coords.latitude = $scope.project.latitude;
		$scope.map.marker.coords.longitude = $scope.project.longitude;
		$scope.map.marker.options.title = $scope.project.name;
		$scope.map.refresh = true; 	  
		$scope.map.markersControl.getGMarkers()[0].title = $scope.project.name;
	  
		Restangular.oneUrl('users', $scope.project.owner).get().then(function(publisher) {
			$scope.publisher = publisher;
		});
	  	  
	});

	// **** IMAGE POP-UP ****
	  
	var ModalInstanceCtrl = function ($scope, $modalInstance, image) {
	  
		$scope.image = image;
		
		// $scope.ok = function () {
			//   $modalInstance.close($scope.selected.item);
			// };
	  
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};


		};

		$scope.open = function (size) {
		

			var modalInstance = $modal.open({
				templateUrl: 'myModalContent.html',
				controller: ModalInstanceCtrl,
				windowClass: "modal fade in",
				size: size,
				resolve: {
					image: function () {			  
						return $scope.project.image_file;
					}
				}
			});

			modalInstance.result.then(function (selectedItem) {
				//$scope.selected = selectedItem;
			});
		};
	
});

app.controller('MenuCtrl', function($rootScope, $scope, $http, $window, api, menuVisibilityService, AuthService){

	$scope.isLogged = false;
	$scope.username = "";

	function updateIsLogged(newValue, oldValue) {
		$scope.isLogged = newValue;
		$scope.username = AuthService.getUsername();
	}

	$scope.$watch(AuthService.checkLogin, updateIsLogged);	

	$scope.reInit = function(){
		$window.location.href = '/';
	};

	$scope.menuShow = function(){
		menuVisibilityService.setTrueTag();	 
	};

	$scope.menuHide = function(){
		menuVisibilityService.setFalseTag();
	};

	$scope.menuVisibility = function(){
		return menuVisibilityService.menuVisibilityVar;
	};

	// **** Authentication ****

	// Angular does not detect auto-fill or auto-complete. If the browser
	// autofills "username", Angular will be unaware of this and think
	// the $scope.username is blank. To workaround this we use the 
	// autofill-event polyfill [4][5]

	$('#id_auth_form input').checkAndTriggerAutoFillEvent();

	$scope.getCredentials = function(){
		return {username: $scope.username, password: $scope.password};
	};
	
	$scope.login = function(){
		api.auth.login($scope.getCredentials()).
		$promise.
		then(function(data){
			// on good username and password
			$scope.user = data.username;
			AuthService.login(data.username);					
		}).
		catch(function(data){
			// on incorrect username and password
			alert(data.data.detail);
		});
	};

	$scope.logout = function(){
		api.auth.logout(function(){
			$scope.user = undefined;
			AuthService.logout();
		});
	};
	$scope.register = function($event){
		// prevent login form from firing
		$event.preventDefault();
		// create user and immediatly login on success
		api.users.create($scope.getCredentials()).
		$promise.
		then($scope.login).
		catch(function(data){
			alert(data.data.username);
		});
	};

});

app.controller('SearchCtrl', function($scope, $http, $location, Projects){

	$scope.architect = "";
	$scope.project_name = "";
	$scope.owner = "";
	$scope.address = "";

	$scope.search = function() {
	
		var searchParams = {project_name: $scope.project_name, architect: $scope.architect, owner: $scope.owner, address: $scope.address};
		Projects.searchProjects(searchParams);
		if ($location.path() != '/' && $location.path() != '/map') {$location.path('/')};	
	}
});

app.controller("AddCtrl",function ($scope, $http, $location, Projects) {

	// GMaps box
	$scope.gmapbox_result = '';
	$scope.gmapbox_options = null;
	$scope.gmapbox_details = '';
	
	$scope.formData = {};
	
	$scope.add= function() {
			
		fd = new FormData();
		fd.append('name', $scope.formData.name);
		fd.append('architect', $scope.formData.architect);
		fd.append('address', $scope.gmapbox_details.formatted_address);
		try {
			fd.append('latitude', $scope.gmapbox_details.geometry.location.k);
			fd.append('longitude', $scope.gmapbox_details.geometry.location.B);
		}
		catch(err) {
			console.log(err);
		}
		
		fd.append('image', $scope.image);
		fd.append('image', $scope.image);
			
		$http.post('/add/', fd, {
			transformRequest: angular.identity,
			headers: {'Content-Type': undefined}
		})
		.success(function(id){
			console.log("posted");
			Projects.initProjects();
			$location.path('/projects/' + id );
		})
		.error(function(){
		});
	

	
	}


});

app.controller("MapCtrl", function ($scope, $http, $location, Projects) {

	// **** Interface to service Projects ****

	$scope.projects = Projects.getProjects();
	$scope.noResult = Projects.givesNoResult();
	
	function updateProjects(newValue, oldValue) {
		
		$scope.projects = newValue;		
		$scope.noResult = Projects.givesNoResult();
		
		var bounds = new google.maps.LatLngBounds();
		
		for (var i in $scope.projects)
		{
			currentPosition = new google.maps.LatLng($scope.projects[i].latitude, $scope.projects[i].longitude);
			bounds.extend(currentPosition);
		};
		
		$scope.map.control.getGMap().fitBounds(bounds);
				
	}

	$scope.$watch(Projects.getProjects, updateProjects);	

	// **** GOOGLE MAP ****

	angular.extend($scope, {

		map: {
			control: {},
			markersControl: {},
			refresh: true,
			center: {
				latitude: 0,
				longitude: 0
			},
			zoom: 5,
			bounds: {},
			dragging: false,
			options: {},
			events: {}
		}
	});
		 	
	google.maps.visualRefresh = true;
	$scope.map.events = {
		tilesloaded: function (map) {
			$scope.$apply(function () {
				$scope.mapInstance = map;
			});
		}
	};

	$scope.seeProject = function(id) {
		$location.path('/projects' + id);
		$scope.$apply();
	};

});