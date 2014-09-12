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
	
	var currentUser;
    var username = "";
	var isLogged = false;
    var is_staff = false;
	
	this.login = function(usr) {
		isLogged = true;        
		currentUser = usr;        
        username = usr.username;
        is_staff = usr.is_staff;
	};
	
	this.logout = function() {
		isLogged = false;
		currentUser = null;	
        is_staff = false;	
	};
	
	this.checkLogin = function() {
		return isLogged;
		
	};
	
	this.getUsername = function() {
		return username;
	};
    
	this.getUser = function() {
		return currentUser;
	};
    
    this.isStaff = function() {
        return is_staff;
    }
	
});

app.factory('Projects', ['$http',
  function($http) {
      
      var nInitialItems = 9;
      var nItemsToFetch = 9;
	  
      var currentSource = 'home';
      var currentSearchParams = {};
      
	  var factory = {};
	  var projects;
      var currentProject;
	  var noResult = false;
      
	  var requestProjects = function(after, nItems) {
		  $http.get('/api/projects/', {params: {after: after, nitems: nItems}})
          .success(function (data,status) { projects = data; });
		  return projects;
	  };
      
      factory.getNInitialItems = function() {
          return nInitialItems;
      };
      
      factory.getNItemsToFetch = function() {
          return nItemsToFetch;
      };
      
      factory.getAfter = function() {
          return after;
      };
      
      factory.getCurrentSource = function() {
          return currentSource;
      };
      
      factory.getCurrentSearchParams = function() {
          return currentSearchParams;
      };

	  factory.getProjects = function() {
		  return projects;
	  };
      
      factory.setCurrentProject = function(data) {
          currentProject = data;
	  };
      
      factory.getCurrentProject = function() {
          return currentProject;  
      };
            	  
	  factory.givesNoResult = function() {
		  return noResult;
	  };
      
      factory.requestProjects = function(after, nItems) {
          return requestProjects(after, nItems);
      }
      
      factory.mapProjects = function() {
		  $http.get('/api/map_projects/')
          .success(function (data,status) { projects = data; });
		  return projects;
      };
      
      factory.requestAllProjects = function(after, nItems) {
		  $http.get('/api/projects/')
          .success(function (data,status) { projects = data; });
		  return projects;
      };
      
      factory.initProjects = function() {
          currentSource = 'home';
          return requestProjects(0, nInitialItems);
      };
	  
	  factory.searchProjects = function(searchParams) {
          
          var params = angular.extend(searchParams, {after: 0, nitems: nInitialItems});
          
		  $http.get('/api/search/', {params: params})
		  .success(function (data,status) {
			  projects = data; 
			  noResult = Boolean(projects.length == 0);
              currentSource = 'search';
              console.log(currentSource);
              currentSearchParams = searchParams;            
		  });	  
		  return projects;
	  };
	  
	  return factory;
	  
}]);


