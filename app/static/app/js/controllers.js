var scotchApp = angular.module('scotchApp', []).config(function($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
});

    scotchApp.controller('AppCtrl',['$scope', function($scope){
    $scope.show = "schubdou";

}]);

/*scotchApp.controller("SinglePageCtlr", function($scope, djangoRMI) {
    $scope.invoke = function() {
        var in_data = { some: 'data' };
        djangoRMI.process_something(in_data)
           .success(function(out_data) {
			   console.log("Youhouhou");
               test = out_data;
           });
    };
});*/