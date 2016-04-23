timeOff.controller('confirmController',
	['$scope', '$rootScope', '$timeout', '$location', '$routeParams', 'Authentication', 'Auth', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', 'ErrorSuccessClass',  
	function ($scope, $rootScope, $timeout, $location, $routeParams, Authentication, Auth, $firebaseArray, $firebaseObject, FIREBASE_URL, ErrorSuccessClass) {
		
		$rootScope.pageName = "confirm";
		$rootScope.message = null;
		$scope.message = null;
		$scope.errorMessage = null;
		$scope.characters = 2;
	
		var ref = new Firebase(FIREBASE_URL + 'tempUsers/' + $routeParams.token);
		var tempUserInfo = $firebaseObject(ref);
		$scope.temail = tempUserInfo;
				
		$scope.changePassword = function() {
			Auth.$changePassword({
				
				email: tempUserInfo.email,
				oldPassword: $scope.token,
				newPassword: $scope.password.new
				
			}).then(function() {
				
				$scope.message = "Password changed successfully!";
				
				$timeout(function() {
					$scope.message = null
				}, 4000);
				
				$scope.password.current = null;
				$scope.password.new = null;
				$scope.password.confirm = null;
				
				$timeout(function() {
					$scope.redirectMessage = "Redirecting to main site...";
				}, 4000);
				
				$location.path('/schedule');
				
			}).catch(function(error) {
				
				$scope.errorMessage = (error.message==="The specified password is incorrect.") ? "The specified CURRENT PASSWORD is incorrect." : error.message;
				
				$scope.password.current = null;
				$scope.password.new = null;
				$scope.password.confirm = null;
				
				$timeout(function() {
					$scope.errorMessage = null;
				}, 4000);
				
			});
		}
}]);
