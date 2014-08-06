'use strict';

app.service('menuVisibilityService', function() {
    this.menuVisibilityVar = false;
    this.setTrueTag = function() {
        this.menuVisibilityVar = true;
    };    
    this.setFalseTag = function() {
        this.menuVisibilityVar = false;
    };
});

app.service('AuthService', function() {
	
	var username = "";
	var isLogged = false;
	
	this.login = function(usr) {
		isLogged = true;
		username = usr;
	};
	
	this.logout = function() {
		isLogged = false;
		username = "";		
	};
	
	this.checkLogin = function() {
		return isLogged;
		
	};
	
	this.getUsername = function() {
		return username;
	};
	
});

app.factory('Project', ['$resource',
  function($resource){
    return $resource('api/projects/:projectId/', {}, {
      query: {method:'GET', params:{projectId:'projects'}}
    });
}]);