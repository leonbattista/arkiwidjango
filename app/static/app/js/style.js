var menuVisibilityVar = false;


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
            console.log("window bigger than 1500 = " + window.innerWidth);
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
        	console.log("window smaler than 1500 = " + window.innerWidth);
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
            console.log("col. widths: " + Elemcolumn1.style.width + " " + Elemcolumn2.style.width + " " + Elemcolumn3.style.width);
            //console.log("project margins: " + $scope.ProjectMargin);
            console.log("menuVisibilityVar: " + menuVisibilityVar);
        });
    }

jsApp.controller('MenuCtrl', function($scope){
    $scope.menuShow = function(){
     menuVisibilityVar = true;
    }

    $scope.menuHide = function(){
     menuVisibilityVar = false;
    } 

    $scope.menuVisibility = function(){
     return menuVisibilityVar;
    }
});

/*
scotchApp.controller('AppCtrl',['$scope', function($scope){
    var show = false;

    $scope.on = function(){
     show = true;
    }

    $scope.off = function(){
     show = false;
    } 

    $scope.showColumn2 = function(){
     return show;
    }
}]);*/
