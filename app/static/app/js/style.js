jsApp.directive('resize', function ($window, menuVisibilityService) {
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
                    'width': (80) + 'px'
                };
            };
            scope.column2style = function () {
                return {
                    'width': (240) + 'px'
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


/*



    document.addEventListener("DOMContentLoaded", jsStyles, false);
    window.onresize = jsStyles;

    //function to change column widths dynamically
    function jsStyles() {

        //console.log("Window Width " + window.innerWidth);
        //console.log("Images per line " + Math.floor(window.innerWidth/400));

        var 
        Elemcolumn1 = document.getElementById('column1'),
        Elemcolumn2 = document.getElementById('column2'),
        Elemcolumn3 = document.getElementById('column3'),
        Elemcbutton = document.getElementById('closebutton'),
        //ProjectMargin,

        scopeElemcolumn1 = angular.element(Elemcolumn1).scope(); // bad coding 


        if (window.innerWidth >= 1500) {
            //console.log("window bigger than 1500 = " + window.innerWidth);
            column1Width = 100;
            column2Width = 250;
                if (menuVisibilityVar == true) {
                    column3Width = window.innerWidth - 350;
                }
                else {
                    column3Width = window.innerWidth - 100;
                }
    	}
    	else {
        	//console.log("window smaler than 1500 = " + window.innerWidth);
            column1Width = 70;
            column2Width = 150;
                if (menuVisibilityVar == true) {
                    column3Width = window.innerWidth - 350;
                }
                else {
                    column3Width = window.innerWidth - 100;
                }
    	}	

        cbuttonWidth = column2Width - 20;

        scopeElemcolumn1.$apply(function() { // bad coding 
            Elemcolumn1.style.width = column1Width.toString() + 'px';
            Elemcolumn2.style.left = column1Width.toString() + 'px';
            Elemcolumn2.style.width = column2Width.toString() + 'px';
            Elemcbutton.style.width = cbuttonWidth.toString() + 'px';
            Elemcolumn3.style.width = column3Width.toString() + 'px';
            //$scope.ProjectMargin = ($scope.column3Width - Math.floor($scope.column3Width/400)*400)/(Math.floor($scope.column3Width/400));
            //console.log("col. widths: " + Elemcolumn1.style.width + " " + Elemcolumn2.style.width + " " + Elemcolumn3.style.width);
            //console.log("project margins: " + $scope.ProjectMargin);
            //console.log("menuVisibilityVar: " + menuVisibilityVar);
        });
    }

*/

jsApp.service('menuVisibilityService', function() {
    this.menuVisibilityVar = false;

    this.setTrueTag = function() {
        this.menuVisibilityVar = true;
    };    

    this.setFalseTag = function() {
        this.menuVisibilityVar = false;
    };
});


jsApp.controller('MenuCtrl', function($scope, menuVisibilityService){
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







