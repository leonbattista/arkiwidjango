'use strict';

var jsApp = angular.module('jsApp', []).config(function($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
});

    jsApp.controller('RequestCtrl', function($scope, $http){
	
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

        jsApp.controller('ImagesCtrl', function($scope, $http){
    $http.get('/media/arkiwi/json/images.json').then(function(imagesResponse) {
      $scope.images = imagesResponse.data;
    });
    })