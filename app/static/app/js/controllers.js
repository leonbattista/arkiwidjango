var scotchApp = angular.module('scotchApp', ['ngRoute']);

    // configure our routes
    scotchApp.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/', {
                templateUrl : 'static/arkiwijsmain/html/home.html',
            })

            // route for the search page
            .when('/search', {
                templateUrl : 'static/arkiwijsmain/html/search.html',
            })

            // route for the edit page
            .when('/edit', {
                templateUrl : 'static/arkiwijsmain/html/edit.html',
            })

            .when('/tutorial', {
                templateUrl : 'static/arkiwijsmain/html/tutorial.html',
            });
    });

    // create the controller and inject Angular's $scope
    scotchApp.controller('MenuCtrl', function($scope, $http){
    $http.get('/static/arkiwijsmain/json/menus.json').then(function(menusResponse) {
      $scope.menus = menusResponse.data;
    });
    })

    scotchApp.controller('ImagesCtrl', function($scope, $http){
    $http.get('/static/arkiwijsmain/json/images.json').then(function(imagesResponse) {
      $scope.images = imagesResponse.data;
    });
    })




//ng-show/hide column2
    scotchApp.controller('AppCtrl',['$scope', function($scope){
    var show = false;

    $scope.on = function(){
     show = true;
    }

    $scope.off = function(){
     show = false;
     elementWidth(show);
    } 

    $scope.showColumn2 = function(){
     return show;
    }
}]);


//////////////////////////////// -- dynamic styles -- ///////////////////////////////////
//get $scope of window width and change the width of a specific #id
function elementWidth() {
    var domElt = document.getElementById('column3');
    scope = angular.element(domElt).scope();
    scope.$apply(function() {
        scope.width = window.innerWidth - 370;
        scope.height = window.innerHeight;
        domElt.style.width = scope.width.toString() + 'px';
    });
}
//first call of elementWidth when the dom is loaded
document.addEventListener("DOMContentLoaded", elementWidth, false);

//calling elementWidth on resize event
window.onresize = elementWidth;

//change styles of #imagegallery
var column3st = document.getElementById('column3').style
    column3st.cssFloat = 'right';
    //imagegalleryst.backgroundColor = 'green';

//change styles of #iteminimagegallery
var column3contentst = document.getElementById('column3content').style
    column3contentst.margin = '10px';

