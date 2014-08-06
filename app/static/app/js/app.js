'use strict';

var app = angular.module('arkiwiApp', [
  'ngResource',
  'ngRoute'
]);

app.config(function($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    // django and angular both support csrf tokens. This tells
    // angular which cookie to add to what header.
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
});

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
      when('/projects/:projectId', {
        templateUrl: '/static/app/partials/project-detail.html',
        controller: 'ProjectDetailCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

app.run(function ($http, $rootScope, AuthService) {
	console.log("Entering app run");
	$http.get('/api/current_user/').
	success(function(data) { 
		if (data != "") {
			AuthService.login(data);
			console.log("Logged user " + data);	
		};
	});
});
	 

/*$http
    .get('/projects/', {
        /*params: {
            a: "corbu",
            b: "5"
     })*/
