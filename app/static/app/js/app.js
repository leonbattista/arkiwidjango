'use strict';

var app = angular.module('arkiwiApp', [
'ngResource',
'ngRoute',
'ngAnimate',
 'restangular',
'ui.bootstrap',
'ngAutocomplete',
'google-maps',
'infinite-scroll'
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
	when('/map', {
		templateUrl: '/static/app/partials/map.html',
		controller: 'MapCtrl'
	}).
	when('/projects/:projectId', {
		templateUrl: '/static/app/partials/project-detail.html',
		controller: 'ProjectDetailCtrl'
	}).
	when('/project-edit/:projectId', {
		templateUrl: '/static/app/partials/project-edit.html',
		controller: 'ProjectEditCtrl'
	}).
	when('/explore', {
		templateUrl: '/static/app/partials/explore.html',
		controller: 'ExploreCtrl'
	}).
	when('/explore/:wikiPageId', {
		templateUrl: '/static/app/partials/explore.html',
		controller: 'ExploreCtrl'
	}).    
	otherwise({
		redirectTo: '/'
	});
}]);


app.config(function(RestangularProvider) {
     RestangularProvider.setBaseUrl('/api');
     RestangularProvider.setRequestSuffix('/');
});

app.run(function ($http, $rootScope, $location, api, AuthService, Projects) {
	
	$http.get('/api/current_user/').
	success(function(data) { 
		if (data != "") {

            AuthService.login(data);

		};
	});
	
	Projects.initProjects();
	
});
