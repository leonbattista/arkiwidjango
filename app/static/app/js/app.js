'use strict';

var app = angular.module('arkiwiApp', [
  'ngResource',
  'ngRoute',
  'ui.bootstrap',
  'ngAutocomplete',
  'google-maps'
  
]);

app.config(function($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    // django and angular both support csrf tokens. This tells
    // angular which cookie to add to what header.
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
});

app.config(['$resourceProvider', function ($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = false;
}]);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: '/static/app/partials/projects.html',
        controller: 'ProjectsCtrl'
      }).
      when('/search', {
        templateUrl: '/static/app/partials/search.html',
        controller: 'SearchCtrl'
      }).
      when('/sandbox', {
        templateUrl: '/static/app/partials/sandbox.html',
		controller: 'ModalDemoCtrl'
	  }).
      when('/projects/:projectId', {
        templateUrl: '/static/app/partials/project-detail.html',
        controller: 'ProjectDetailCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

app.run(function ($http, $rootScope, AuthService, Projects) {
	
	
	$http.get('/api/current_user/').
	success(function(data) { 
		if (data != "") {
			AuthService.login(data);
		};
	});
	
	var projects = Projects.initProjects();
	
});
	 

/*$http
    .get('/projects/', {
        params: {
            a: "corbu",
            b: "5"
     })*/
