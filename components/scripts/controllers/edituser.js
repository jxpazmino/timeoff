timeOff.controller('edituserController',
	['$scope', '$rootScope', '$location', 'CheckIfAdmin', 'Authentication', '$routeParams', 'Auth', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', 'ErrorSuccessClass',  
	function ($scope, $rootScope, $location, CheckIfAdmin, Authentication, $routeParams, Auth, $firebaseArray, $firebaseObject, FIREBASE_URL, ErrorSuccessClass) {
		
		CheckIfAdmin();
		
		$rootScope.pageName = 'edituser';
		$scope.whichUser = $routeParams.uId;
		var ref = new Firebase(FIREBASE_URL);
		var userRef = ref.child('users/' + $scope.whichUser + '/');

		
		Auth.$onAuth(function (authUser) {
			if (authUser) {
				$scope.user = $firebaseObject(userRef);
				$scope.$apply();
				$scope.user.timeType = "days";
			}
		});
		
		$scope.save = function() {
			if($scope.user && $scope.user.userType && $scope.user.firstName && $scope.user.lastName && $scope.user.email && $scope.user.eligibleDays && $scope.user.timeType) {
				$rootScope.message = null;
				var submitButton = $('#editUserSubmitButton');
				submitButton.text("Processing...");
				submitButton.prop("disabled",true);
				
				
				var eligibleDays = 0;
				if($scope.user.timeType==='weeks') {
					eligibleDays = $scope.user.eligibleDays * 5;
				} else {
					eligibleDays = $scope.user.eligibleDays * 1;
				}
				
				var userObj = {
					userType : $scope.user.userType,
					firstName : $scope.user.firstName,
					lastName : $scope.user.lastName,
					eligibleDays : eligibleDays,
					status: $scope.user.status
				};
				userRef.update(userObj);
				$location.path('/userslist');
				
				/*
				var randomTempPassword = GenerateRandomPassword(16).toString();
				Auth.$createUser({
					
					email: user.email.toLowerCase(),
					password: randomTempPassword
					
				}).then(function (regUser) {
					
					var eligibleDays = 0;
					if(user.timeType==='weeks') {
						eligibleDays = user.eligibleDays * 5;
					} else {
						eligibleDays = user.eligibleDays * 1;
					}
					
					//user has been registered successfully
					//now store fields in DB
					var ref = new Firebase(FIREBASE_URL);
					
					ref.child('users/' + regUser.uid).set({
						date: Firebase.ServerValue.TIMESTAMP,
						regUser: regUser.uid,
						firstName: CapitalizeEachWord(user.firstName),
						lastName: CapitalizeEachWord(user.lastName),
						email: user.email.toLowerCase(),
						userType: user.userType,
						eligibleDays: eligibleDays || "",
						lastLoginDate: "never",
						remainingDays: eligibleDays || "",
						status: "enabled",
						blockCalendar: true
					});
					
					ref.child('sync/schedule/enabledUsers').transaction(function (current_value) {
						return (current_value || 0) + 1;
					});
					
					Auth.$resetPassword({
						email: user.email.toLowerCase()		
					}).then(function() {
						$location.path('/userslist');
					}).catch(function(error) {
						$rootScope.message = error.message;
					});
					
				}).catch(function (error) {
					
					$timeout(function() {
						$rootScope.message = error.message;
						submitButton.text("Submit");
						submitButton.prop("disabled",false);
					}, 2000);
					
				}); //  $createUser	*/
				
			} else {
				return false;
			}
		}
		
}]);