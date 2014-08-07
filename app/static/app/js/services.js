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

app.factory('Projects', ['$http',
  function($http) {
	  
	  var factory = {};
	  var projects;
	  var noResult = false;  

	  factory.getProjects = function() {
		  return projects;
	  };
	  
	  factory.givesNoResult = function() {
		  return noResult;
	  };
	  
	  factory.initProjects = function() {
		  $http.get('/api/projects/').success(function (data,status) { projects = data; });
		  return projects;
	  };
	  
	  factory.searchProjects = function(searchParams) {
		  $http.get('/search/', {params: searchParams})
		  .success(function (data,status) {
			  projects = data; 
			  noResult = Boolean(projects == '');
		  });	  
		  return projects;
		  
	  };
	  
	  return factory;
	  
}]);


