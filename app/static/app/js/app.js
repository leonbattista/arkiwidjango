'use strict';

var app = angular.module('arkiwiApp', [
  'ngResource',
]);

app.config(function($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
});

app.controller('RequestCtrl', function($scope, $http){

$http.get('/projects/').success(function (data,status) {$scope.projects = data; });

});


// **** User authentification ****

app.config(['$httpProvider', function($httpProvider){
        // django and angular both support csrf tokens. This tells
        // angular which cookie to add to what header.
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}])
	
app.factory('api', function($resource){
        function add_auth_header(data, headersGetter){
            // as per HTTP authentication spec [1], credentials must be
            // encoded in base64. Lets use window.btoa [2]
            var headers = headersGetter();
            headers['Authorization'] = ('Basic ' + btoa(data.username +
                                        ':' + data.password));
        }
        // defining the endpoints. Note we escape url trailing dashes: Angular
        // strips unescaped trailing slashes. Problem as Django redirects urls
        // not ending in slashes to url that ends in slash for SEO reasons, unless
        // we tell Django not to [3]. This is a problem as the POST data cannot
        // be sent with the redirect. So we want Angular to not strip the slashes!
        return {
            auth: $resource('/api/auth\\/', {}, {
                login: {method: 'POST', transformRequest: add_auth_header},
                logout: {method: 'DELETE'}
            }),
            users: $resource('/api/users\\/', {}, {
                create: {method: 'POST'}
            })
        };
})
	
app.controller('authController', function($scope, api) {
        // Angular does not detect auto-fill or auto-complete. If the browser
        // autofills "username", Angular will be unaware of this and think
        // the $scope.username is blank. To workaround this we use the 
        // autofill-event polyfill [4][5]
        $('#id_auth_form input').checkAndTriggerAutoFillEvent();
 
        $scope.getCredentials = function(){
            return {username: $scope.username, password: $scope.password};
        };
 
        $scope.login = function(){
            api.auth.login($scope.getCredentials()).
                $promise.
                    then(function(data){
                        // on good username and password
                        $scope.user = data.username;
                    }).
                    catch(function(data){
                        // on incorrect username and password
                        alert(data.data.detail);
                    });
        };
 
        $scope.logout = function(){
            api.auth.logout(function(){
                $scope.user = undefined;
            });
        };
        $scope.register = function($event){
            // prevent login form from firing
            $event.preventDefault();
            // create user and immediatly login on success
            api.users.create($scope.getCredentials()).
                $promise.
                    then($scope.login).
                    catch(function(data){
                        alert(data.data.username);
                    });
            };
});
 
// [1] https://tools.ietf.org/html/rfc2617
// [2] https://developer.mozilla.org/en-US/docs/Web/API/Window.btoa
// [3] https://docs.djangoproject.com/en/dev/ref/settings/#append-slash
// [4] https://github.com/tbosch/autofill-event
// [5] http://remysharp.com/2010/10/08/what-is-a-polyfill/



	 


/*$http
    .get('/projects/', {
        /*params: {
            a: "corbu",
            b: "5"
     })*/
