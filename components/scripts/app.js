var timeOff = angular.module('timeOff',
	['ngRoute', 'firebase', 'ui.bootstrap', 'chart.js'])
	.constant('FIREBASE_URL', // path to our firebase db //);

timeOff.run(['$rootScope', '$location', function ($rootScope, $location) {
	$rootScope.$on('$routeChangeError', function (event, next, prev, error) {
		if (error == 'AUTH_REQUIRED') {
			$rootScope.message = null;
			$location.path('/login');
		}
	});
}]);


timeOff.config(['$routeProvider', function ($routeProvider) {
	
	$routeProvider
		.when('/login', {
			templateUrl: '/views/login.html',
			controller: 'registrationController'
		})
		.when('/registration', {
			templateUrl: '/views/registration.html',
			controller: 'registrationController',
			resolve: {
				currentAuth: function (Authentication) {
					return Authentication.requireAuthentication();
				}
			}
		})
		.when('/registration/:uId', {
			templateUrl: '/views/edituser.html',
			controller: 'edituserController',
			resolve: {
				currentAuth: function (Authentication) {
					return Authentication.requireAuthentication();
				}
			}
		})
		.when('/schedule', {
			templateUrl: '/views/schedule.html',
			controller: 'scheduleController',
			resolve: {
				currentAuth: function (Authentication) {
					return Authentication.requireAuthentication();
				}
			}
		})
		.when('/changePassword', {
			templateUrl: '/views/changePassword.html',
			controller: 'changePasswordController',
			resolve: {
				currentAuth: function (Authentication) {
					return Authentication.requireAuthentication();
				}
			}
		})
		.when('/userslist', {
			templateUrl: '/views/userslist.html',
			controller: 'userslistController',
			resolve: {
				currentAuth: function (Authentication) {
					return Authentication.requireAuthentication();
				}
			}
		})
		.when('/requestslist', {
			templateUrl: '/views/requestslist.html',
			controller: 'requestslistController',
			resolve: {
				currentAuth: function (Authentication) {
					return Authentication.requireAuthentication();
				}
			}
		})
		.when('/request', {
			templateUrl: '/views/request.html',
			controller: 'requestController',
			resolve: {
				currentAuth: function (Authentication) {
					return Authentication.requireAuthentication();
				}
			}
		})
		.otherwise({
			redirectTo: '/schedule'
		})
}]);
