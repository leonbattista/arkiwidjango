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

app.factory('Projects', ['$http','$location',
  function($http, $location) {
      
      var nInitialItems = 36;
      var nItemsToFetch = 36;
      
      var onlyImg = true;
      var projectWrapperHeight = 0;
      var projectWrapperHeightUnchanged = false;
	  
      var currentSource = 'home';
      var currentSearchParams = {};
      
	  var factory = {};
	  var projects;
      var currentProject;
	  var noResult = false;
      var mapLoaded = false;
            
      var mapBounds;
      
      factory.setMapBounds = function(bounds) {
          mapBounds = bounds;
      };
      
      factory.getMapBounds = function() {
          return mapBounds;
      }
      
      
	  var requestProjects = function(after, nItems) {
		  $http.get('/api/projects/', {params: {after: after, nitems: nItems, only_img: onlyImg}})
          .success(function (data,status) { projects = data; });
		  return projects;
	  };
      
      factory.getMapLoaded = function() {
          return mapLoaded;
      }
      
      factory.setMapLoaded = function(value) {
          mapLoaded = value;
      }
      
      factory.getProjectWrapperHeight = function() {
          return projectWrapperHeight;
      };
      
      factory.setProjectWrapperHeight = function(value) {
          projectWrapperHeight = value;
      };
      
      factory.getNInitialItems = function() {
          return nInitialItems;
      };
      
      factory.getOnlyImg = function() {
          return onlyImg;
      }
      
      factory.toggleOnlyImg = function() {
          onlyImg = Boolean(!onlyImg);
          return onlyImg;
      }
      
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
          .success(function (data,status) { projects = data; mapLoaded = true});     
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
          
          console.log($location.path());
          
          if ($location.path() !='/map') {
              var params = angular.extend(searchParams, {after: 0, nitems: nInitialItems, only_img: onlyImg});
          }
          
          else {
              params = searchParams;
          }
          
		  $http.get('/api/search/', {params: params})
		  .success(function (data,status) {
			  projects = data; 
			  noResult = Boolean(projects.length == 0);
              currentSource = 'search';
              currentSearchParams = searchParams;
              mapLoaded = true;
		  });	  
	  };
      
      factory.mapTarget = function(boundaries) {
		  $http.get('/api/map_target/', {params: boundaries})
		  .success(function (data,status) {
			  projects = data; 
              console.log(data);
			  noResult = Boolean(projects.length == 0);
              currentSource = 'target';
		  });	
      }
	  
	  return factory;	  
}]);

//Module to autonatically retry on 503 error


// app.factory("retry", ["$q", "$injector", "$timeout", function($q, $injector, $timeout) {
//     return {
//        "responseError": function(rejection) {
//            console.log("Request failed", rejection);
//             // if (rejection.status != 503) {
//             //     console.log("Unhandled status");
//             //     return $q.reject(rejection);
//             // }
//             if (rejection.status != 400) {
//                 var delay = Math.floor(Math.random() * 2000);
//                 console.log("Retrying in " + delay + "ms");
//                 var deferred = $q.defer();
//                 $timeout(function() {
//                     var $http = $http || $injector.get("$http");
//                     deferred.resolve($http(rejection.config));
//                 }, delay);
//                 return deferred.promise;
//             }
//         }
//     };
// }]);
//
// app.config(["$httpProvider", function ($httpProvider) {
//     $httpProvider.interceptors.push("retry");
// }]);