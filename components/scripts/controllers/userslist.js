timeOff.controller('userslistController',
	['$scope', '$rootScope', 'CheckIfAdmin', '$location', '$filter', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', 'Auth', function ($scope, $rootScope, CheckIfAdmin, $location, $filter, $firebaseArray, $firebaseObject, FIREBASE_URL, Auth) {

		CheckIfAdmin();
		
		
		$scope.filter = {
			'order' : "-date",
			"email" : true,
			"pendingDays" : true,
			"approvedDays" : true,
			"eligibleDays" : true,
			"type" : false,
			"status" : false,
			"created" : false
		};
		
		$scope.message = null;
		$rootScope.pageName = "userslist";
		$rootScope.message = null;
		
		var ref = new Firebase(FIREBASE_URL); 

		Auth.$onAuth(function (authUser) {
			if (authUser) {
				var userslistRef = ref.child('users/');
				var userslistInfo = $firebaseArray(userslistRef);
				$scope.userslist = userslistInfo;
			}
		});	
		
		//if user account is disabled, kick to main page
        //and display disabled account msg
		$scope.$watch('currentUser.status', function() {
			if($rootScope.currentUser.status!=='enabled') {
				$location.path('/schedule');
			}
		});

		$scope.changeUserStatus = function(user) {
			
			if(user.status==='enabled') {
				ref.child('users/' + user.regUser).update({status : 'disabled'});
				$scope.currentUserStatus = 'Enable';
				
				//update sync table so it reflects in schedule view
				ref.child('sync/schedule/enabledUsers').transaction(function (current_value) {
					return (current_value || 0) - 1;
				});	
				
			} else {
				ref.child('users/' + user.regUser).update({status : 'enabled'});
				$scope.currentUserStatus = 'Disable';
				
				//update sync table so it reflects in schedule view
				ref.child('sync/schedule/enabledUsers').transaction(function (current_value) {
					return (current_value || 0) + 1;
				});	
			}
		};
		
		
		$scope.unblockCalendar = function(user) {
			
			if(user.blockCalendar===true || user.blockCalendar===undefined) {
				ref.child('users/' + user.regUser).update({blockCalendar : false});
			} else {
				ref.child('users/' + user.regUser).update({blockCalendar : true});
			}
			
		};
		

}]); // Controller