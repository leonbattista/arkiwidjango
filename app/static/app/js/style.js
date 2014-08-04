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
    }
})

app.service('menuVisibilityService', function() {
    this.menuVisibilityVar = false;
    this.setTrueTag = function() {
        this.menuVisibilityVar = true;
    };    
    this.setFalseTag = function() {
        this.menuVisibilityVar = false;
    };
});

app.controller('MenuCtrl', function($scope, menuVisibilityService){
    $scope.menuShow = function(){
     menuVisibilityService.setTrueTag();
    }
    $scope.menuHide = function(){
     menuVisibilityService.setFalseTag();
    }
    $scope.menuVisibility = function(){
     return menuVisibilityService.menuVisibilityVar;
    }
});