app.directive('arkiwiResize', function ($window, menuVisibilityService) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return {
                'h': w.height(),
                'w': w.width()
            };
        };   
        scope.$watch(scope.getWindowDimensions, function (newValue) {
            scope.column1style = function () {
                return {
                    'width': 80 + 'px'
                };
            };
            scope.column2style = function () {
                return {
                    'width': 240 + 'px'
                };
            };
            scope.column3style = function () {
                if (menuVisibilityService.menuVisibilityVar == true) {
                    return {
                    'width': (newValue.w - 320) + 'px'
                    };
                }
                else {
                    return {
                    'width': (newValue.w - 80) + 'px'
                    };
                }
            };
        }, true);
        w.bind('resize', function () {
            scope.$apply();
        });
    };
});

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);