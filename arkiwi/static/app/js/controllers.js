angular_app.controller("SinglePageCtlr", function($scope, djangoRMI) {
    $scope.invoke = function() {
        var in_data = { some: 'data' };
        djangoRMI.process_something(in_data)
           .success(function(out_data) {
               // do something with out_data
           });
    };
});
