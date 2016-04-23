timeOff.controller('changePasswordController',
	['$scope', '$rootScope', '$timeout', '$location', 'Auth',
	function ($scope, $rootScope, $timeout, $location, Auth) {
		
		$rootScope.pageName = "changePassword";
		$rootScope.message = null;
		$scope.message = null;
		$scope.errorMessage = null;
		$scope.characters = 2;
		
		$scope.currentPasswordInputType = 
		$scope.newPasswordInputType = 
		$scope.confirmPasswordInputType = "password";
		
		$scope.currentPasswordEyeIcon = 
		$scope.newPasswordEyeIcon = 
		$scope.confirmPasswordEyeIcon = "glyphicon glyphicon-eye_open";
		
		//if user account is disabled, kick to main page
        //and display disabled account msg
		$scope.$watch('currentUser.status', function() {
			if($rootScope.currentUser.status!=='enabled') {
				$location.path('/schedule');
			}
		});

		$scope.passwordToggle = function(str) {
			if($scope[str+"InputType"]=="password") {
				$scope[str+"InputType"] = "text";
				$scope[str+"EyeIcon"] = "glyphicon glyphicon-eye_close";
			} else {
				$scope[str+"InputType"] = "password";
				$scope[str+"EyeIcon"] = "glyphicon glyphicon-eye_open";
			}
		}
		
		$scope.changePassword = function() {
			var userPassObj = {
				email: $rootScope.currentUser.email,
				oldPassword: $scope.password.current,
				newPassword: $scope.password.new
			};
			
			
			var submitButton = $('#changePasswordFormSubmitButton');
			submitButton.text("Processing...");
			submitButton.prop("disabled",true);
			$timeout(function() {
				submitButton.text("Change Password");
				submitButton.prop("disabled",false);
				$scope.message = "Password changed successfully!";
			}, 1200);
			$scope.password.current = null;
			$scope.password.new = null;
			$scope.password.confirm = null;
			// Auth.$changePassword(userPassObj).then(function() {
				
			// 	$timeout(function() {
			// 		$scope.message = null
			// 	}, 4000);
				
			// }).catch(function(error) {
			// 	submitButton.text("Change Password");
			// 	submitButton.prop("disabled",false);
				
			// 	$scope.errorMessage = 
			// 		(error.message==="The specified password is incorrect.") ? 
			// 			"The specified CURRENT PASSWORD is incorrect." : error.message;
				
			// 	$timeout(function() {
			// 		$scope.errorMessage = null
			// 	}, 4000);
			// });
		}
}]);