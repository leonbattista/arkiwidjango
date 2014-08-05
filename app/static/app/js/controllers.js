app.controller('RequestCtrl', function($scope, $http){

	$http.get('/projects/').success(function (data,status) {$scope.projects = data; });

});

app.controller('MenuCtrl', function($scope, $http, menuVisibilityService, AuthService){
   	
	$scope.isLogged = false;
	$scope.username = "";
	function updateIsLogged(newValue, oldValue) {
		$scope.isLogged = newValue;
		$scope.username = AuthService.getUsername();
		console.log("update" + $scope.username + $scope.isLogged);		
	}
	
	$scope.$watch(AuthService.checkLogin, updateIsLogged);
	
	$scope.menuShow = function(){
     menuVisibilityService.setTrueTag();
	 
    }
    $scope.menuHide = function(){
     menuVisibilityService.setFalseTag();
    }
    $scope.menuVisibility = function(){
     return menuVisibilityService.menuVisibilityVar;
    }
});