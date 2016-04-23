timeOff.controller('requestslistController',
	['$scope', '$rootScope', '$location', 'CheckIfAdmin', 'FIREBASE_URL', function ($scope, $rootScope, $location, CheckIfAdmin, FIREBASE_URL) {
		
		CheckIfAdmin();
		
		$scope.filter = {
			'order' : "-date",
		};
		
		$scope.message = null;
		$rootScope.pageName = "requestslist";
		$rootScope.message = null;
		
		//if user account is disabled, kick to main page
        //and display disabled account msg
		$scope.$watch('currentUser.status', function() {
			if($rootScope.currentUser.status!=='enabled') {
				$location.path('/schedule');
			}
		});
		
		//Gather all requestsfrom all users
		var ref = new Firebase(FIREBASE_URL); 
		
		ref.child('users').on("value", function(snapshot) {
			$scope.requestslist = [];
			var userslist = snapshot.val();
			
			for(var user in userslist) {
				if(userslist.hasOwnProperty(user)) {
					if(userslist[user].hasOwnProperty("requests")) {
						for(var request in userslist[user].requests) {
							var requestInfo = userslist[user].requests[request];
							requestInfo.firstName = userslist[user].firstName;
							requestInfo.lastName = userslist[user].lastName;
							$scope.requestslist.push(requestInfo);
						}
					}
				}
			}
			userslist = null;
		});

}]);
