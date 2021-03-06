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
            scope.mapStyle = function () {
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

app.directive('arkiwiMonitorHeight', function () {
    
    return {
        restrict: 'A',
        link: function(scope, element, Projects) {
            
            scope.getElementHeight = function() {
                return element[0].offsetHeight;
            };
            
            scope.$watch(scope.getElementHeight, function(newValue, oldValue) {
            }, true);
            
        } 
    } 
});

app.directive("keepScrollPos", function($route, $window, $timeout, $location, $anchorScroll) {

    // cache scroll position of each route's templateUrl
    var scrollPosCache = {};

    // compile function
    return function(scope, element, attrs) {

        scope.$on('$routeChangeStart', function() {
            // store scroll position for the current view
            //disable for detail and edit project edit views
            
            leftTemplate = $route.current.loadedTemplateUrl
            
            console.log(leftTemplate);
            
            console.log(Boolean(leftTemplate.indexOf("/project-detail.html") == -1));
            
            if ($route.current && leftTemplate.indexOf("/project-detail.html") == -1 && leftTemplate.indexOf("/project-detail.html") == -1) {
                console.log("Caching scroll");
                scrollPosCache[$route.current.loadedTemplateUrl] = [ $window.pageXOffset, $window.pageYOffset ];
            }
        });

        scope.$on('$routeChangeSuccess', function() {
            // if hash is specified explicitly, it trumps previously stored scroll position
            if ($location.hash()) {
                $anchorScroll();

            // else get previous scroll position; if none, scroll to the top of the page
            } else {
                var prevScrollPos = scrollPosCache[$route.current.loadedTemplateUrl] || [ 0, 0 ];
                
                console.log("prevScrollPos" + prevScrollPos);
                
                $timeout(function() {
                    $window.scrollTo(prevScrollPos[0], prevScrollPos[1]);
                    if (prevScrollPos == [0,0]) {
                        $anchorScroll();
                    }
                }, 0);
            }
        });
    }
});

app.directive('wikiThumbResize', function(){ 
   return {
     restrict: 'A',
     link: function(scope, elem, attr) {
         elem.on('load', function() {
            var w = $(this).width(),
                h = $(this).height();

            var div = elem;
            
            if (h < 300)
            {
                div['0']['src'] = div.context['src'].replace("?width=400", "?width=" + 400*300/h);
            }
            

            //check width and height and apply styling to parent here.
         });
     }
   };
});

app.directive('imgPreload', function($rootScope, $timeout) {
    return {
      restrict: 'A',
      scope: {
        ngSrc: '@'
      },
      link: function(scope, element, attrs) {
        element.on('load', function() {
        $timeout(function(){element.removeClass('fadein');},1500);
            
          element.addClass('fade-img');
          element.removeClass('image-loading');
          element.parent().find('span').remove();          
        })

        scope.$watch('ngSrc', function(newVal) {
            element.addClass('fadein');
            element.addClass('image-loading');
            element.parent().addClass('loaderParent');
            element.parent().append("<span class='spinner'><img src='/static/app/images/loading.gif'></span>")
          
        });
      }
    };
});