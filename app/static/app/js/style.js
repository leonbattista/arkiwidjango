//////////////////////////////// -- dynamic styles -- ///////////////////////////////////
document.addEventListener("DOMContentLoaded", jsStyles, false);
window.onresize = jsStyles;

function jsStyles($scope) {

    //console.log("Window Width " + window.innerWidth);
    //console.log("Images per line " + Math.floor(window.innerWidth/400));

    var 
    Elemcolumn1 = document.getElementById('column1'),
    Elemcolumn2 = document.getElementById('column2'),
    Elemcolumn3 = document.getElementById('column3'),

    scopeElemcolumn1 = angular.element(Elemcolumn1).scope();


    if (window.innerWidth >= 1500) {
    console.log("window bigger than 1500 = " + window.innerWidth);
    $scope.column1Width = 100;
    $scope.column2Width = 250;
    $scope.column3Width = window.innerWidth - 405;
	}
	else {
	console.log("window smaler than 1500 = " + window.innerWidth);
    $scope.column1Width = 70;
    $scope.column2Width = 150;
    $scope.column3Width = window.innerWidth - 305;	
	}	

    scopeElemcolumn1.$apply(function() {
        Elemcolumn1.style.width = $scope.column1Width.toString() + 'px';
        Elemcolumn2.style.left = $scope.column1Width.toString() + 'px';
        Elemcolumn2.style.width = $scope.column2Width.toString() + 'px';
        Elemcolumn3.style.width = $scope.column3Width.toString() + 'px';
        console.log("col. widths: " + Elemcolumn1.style.width + " " + Elemcolumn2.style.width + " " + Elemcolumn3.style.width);

    });

}