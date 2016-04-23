timeOff.controller('registrationController',
	['$scope', 'CheckIfAdmin', 'Authentication', '$firebaseArray', 'FIREBASE_URL', 'ErrorSuccessClass',  
	function ($scope, CheckIfAdmin, Authentication, $firebaseArray, FIREBASE_URL, ErrorSuccessClass) {
		
		CheckIfAdmin();
		// $scope.thisYear = new Date();
		
		$scope.formDisplay = {
			loginForm : true,
			resetFrom : false
		};

		$scope.user = {
			email: 'timeoffdemo@gmail.com',
			password: 'demo'
		}
		
		$scope.errorSuccessClass = function (element) {
			return ErrorSuccessClass.validate(element);
		};

		$scope.login = function () {
			Authentication.login($scope.user);
		};
		
		$scope.register = function () {
			Authentication.register($scope.user);
		};
		
		$scope.logout = function () {
			Authentication.logout();
		};
		
		$scope.resetPassword = function() {
			// Authentication.reset($scope.user);
			$scope.user = null;
		};
		
		$scope.forgotPassword = function (action) {
			if(action === 'reset') {
				$scope.formDisplay.loginForm = false;
				$scope.formDisplay.resetForm = true;
			} else {
				$scope.formDisplay.loginForm = true;
				$scope.formDisplay.resetForm = false;
			}
		};
		
}]);