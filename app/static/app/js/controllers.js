app.controller('ProjectsCtrl', function($scope, $http, Projects) {

	$scope.projects = Projects.getProjects();
	$scope.noResult = Projects.givesNoResult();
		
	function updateProjects(newValue, oldValue) {
		$scope.projects = newValue;		
		$scope.noResult = Projects.givesNoResult();
		console.log('Noresult: ' + $scope.noResult);
	}
	
	$scope.$watch(Projects.getProjects, updateProjects);	
	
});


app.controller('ProjectDetailCtrl', ['$scope', '$routeParams', '$modal', '$http',
  function($scope, $routeParams, $modal, $http) {
	  
    $http.get('api/projects/' + $routeParams.projectId + '/').success(function(data) {
      $scope.project = data;
    });
	
	// Pop-up
	
    $scope.items = ['item1', 'item2', 'item3'];
  
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
	
  }]);

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
	
	$scope.search = function() {
		
		var searchParams = {project_name: $scope.project_name, architect: $scope.architect};
		Projects.searchProjects(searchParams);
		$location.path('/');
		
	}
});