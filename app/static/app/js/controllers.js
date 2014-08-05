app.controller('ProjectsCtrl', function($scope, $http){

	$http.get('/api/projects/').success(function (data,status) {$scope.projects = data; });

});

app.controller('MenuCtrl', function($rootScope, $scope, $http, api, menuVisibilityService, AuthService){
   	
	$scope.isLogged = false;
	$scope.username = "";
	
	function updateIsLogged(newValue, oldValue) {
		$scope.isLogged = newValue;
		$scope.username = AuthService.getUsername();
	}
	
	$scope.$watch(AuthService.checkLogin, updateIsLogged);	
	
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