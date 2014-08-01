'use strict';

var jsApp = angular.module('jsApp', []).config(function($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
});

jsApp.controller('RequestCtrl', function($scope, $http){

$http.get('/projects/').success(function (data,status) {$scope.projects = data; });

});
	 


/*$http
    .get('/projects/', {
        /*params: {
            a: "corbu",
            b: "5"
     })*/
