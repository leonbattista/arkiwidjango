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
      when('/search', {
        templateUrl: 'partials/search.html',
        controller: 'SearchCtrl'
      }).
      when('/projects/:projectId', {
        templateUrl: 'partials/project-detail.html',
        controller: 'ProjectDetailCtrl'
      })
  }]);

app.run(function ($http, $rootScope, AuthService) {
	$http.get('/api/current_user/').success(function(data) { if (data != "") AuthService.login(data);});
});
	 

/*$http
    .get('/projects/', {
        /*params: {
            a: "corbu",
            b: "5"
     })*/
