'use strict';

var testApp = angular.module('testApp', []).config(function($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
});

    testApp.controller('AppCtrl', function($scope, $http){
	
	$http
	    .get('/test/', {
	        params: {
	            a: "OK-",
	            b: "5"
	        }
	     })
	     .success(function (data,status) {
	          $scope.info_show = data["reponse"];
			  $scope.info_show2 = data["testB"];
			  $scope.bidon = ["a", "zwou", "bling", "a", "zwou", "bling", "a", "zwou", "bling", "a", "zwou", "bling", "a", "zwou", "bling", "a", "zwou", "bling", ]
	     });

});