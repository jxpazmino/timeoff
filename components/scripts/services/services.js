timeOff.service('GenerateRandomPassword', function () {
	return function(passlength) {
		var possibleChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@#?!_-";
		var password = "";
		
		for (var i = 0; i < passlength; i++) {
			password += possibleChars[Math.floor(Math.random() * possibleChars.length)];
		}
		
		return password;
	}
});



timeOff.service('AddDayToDate', function () {
	return function(date, numberDaysLater) {
		var laterDate = new Date(date);
		laterDate.setDate(laterDate.getDate() + numberDaysLater);
		return laterDate;
	}
});



//including start and end date in array
timeOff.service('AllDatesBetweenTwoDatesToArray', ['$filter', 'AddDayToDate', function ($filter, AddDayToDate) {
	
	//from and until format: "MMM dd, yyyy"
	return function(from, until) {		
		var startDate = new Date(from);
		var stopDate = new Date(until);
	
		var dateArray = new Array();
		var currentDate = startDate;
	
		while (currentDate <= stopDate) {
			dateArray.push($filter('date')(currentDate, 'yyyy-MM-dd'));
			currentDate = AddDayToDate(currentDate, 1);
		}
		return dateArray;
	}
}]);



timeOff.service('MillisToDate', function () {
	return function(millis, separator) {
		var time = new Date(millis).getTime();
		var date = new Date(time);
		return date.getFullYear() + separator + ("0" + (date.getMonth() + 1) ).slice(-2) + separator + ("0" + date.getDate()).slice(-2);
	}
});



timeOff.service('CapitalizeEachWord', function() {
	return function(str) {
		if(str!=null)
		return str.replace(/\w\S*/g, function(txt){
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}); 
	}
});


	
timeOff.service('Auth', ['$firebaseAuth', 'FIREBASE_URL', function($firebaseAuth, FIREBASE_URL) {
	var ref = new Firebase(FIREBASE_URL);
	return $firebaseAuth(ref);
}]);



// Restrict unauthorized users (not admins) from accessing register, userslist, locations pages
timeOff.service('CheckIfAdmin', ['$rootScope', '$location', function($rootScope, $location) {
	return function() {
		if($rootScope.currentUser && $rootScope.currentUser.hasOwnProperty("userType")) {
			if($rootScope.currentUser.userType !== 'admin') {
				return $location.path("/schedule");
			}
		}
	}
}]);



// Remove duplicates and empty strings in array
timeOff.service('RemoveDuplicatesInArray', function() {
	return function(array) {
		var unique = [];
		for (var i = 0; i < array.length; i++) {
			var current = array[i];
			if(current==="") continue;
			if(unique.indexOf(current) < 0) unique.push(current);
		}
		return unique;
	}
});



timeOff.service('Authentication', 
	['$rootScope', '$location', '$timeout', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', 'Auth', 'CapitalizeEachWord', 'GenerateRandomPassword', 'CheckIfAdmin', function ($rootScope, $location, $timeout, $firebaseArray, $firebaseObject, FIREBASE_URL, Auth, CapitalizeEachWord, GenerateRandomPassword, CheckIfAdmin) {
		
		
		$rootScope.message = null;
		
		Auth.$onAuth(function(authUser) {
			if(authUser) {
				var userRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid + '/');
				var userObj = $firebaseObject(userRef);
				userRef.update({lastLoginDate: Firebase.ServerValue.TIMESTAMP});
				$rootScope.currentUser = userObj;
			} else {
				$rootScope.currentUser = null;
			}
		});
		
		var authenticationObj = {
			login: function (user) {
				var submitButton = $('#loginFormSubmitButton');
				submitButton.text("Validating...");
				submitButton.prop("disabled",true);
				Auth.$authWithPassword({
					"email": user.email.toString(),
					"password": user.password.toString()
				}).then(function(regUser) {
					$rootScope.message = null;
					$location.path('/schedule');
				}).catch(function(error) {
					$rootScope.message = "Account combination not found";
					submitButton.text("Sign In");
					submitButton.prop("disabled",false);
					$timeout(function() {
						$rootScope.message = null;
					}, 3000);
				});
			}, //login
			
			logout: function () {
				$rootScope.message = null;
				$rootScope.currentUser.userType = 'admin';
				return Auth.$unauth();
			}, //logout
			
			requireAuthentication: function () {
				return Auth.$requireAuth();
			}, //require Authentication
			
			reset: function (user) {
				Auth.$resetPassword({
					"email": user.emailReset.toString()
				}).then(function() {
					$rootScope.successMessage = "Temporary password sent succesfully";
					$timeout(function() {
						$rootScope.successMessage = null;
					}, 3500);
				}).catch(function(error) {
					$rootScope.message = "That email doesn't match our records";
					$timeout(function() {
						$rootScope.message = null;
					}, 3500);
				});
			}, //reset
			
			register: function (user) {
				if(user && user.userType && user.firstName && user.lastName && user.email && user.eligibleDays && user.timeType) {
					$rootScope.message = null;
					var submitButton = $('#registrationFormSubmitButton');
					submitButton.text("Processing...");
					submitButton.prop("disabled",true);
					
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
							pendingDays: 0,
							approvedDays: 0,
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
						
					}); //  $createUser	
					
				} else {
					return false;
				}
			} // register
			
		};
		
		return authenticationObj;
}]); // Controller


// Adds error or success class to display in forms on user input
timeOff.service('ErrorSuccessClass', function () {
	return {
		validate: function (element) {
			var className = '';

			if (element.$dirty && element.$invalid) {
				className += 'has-error';
			}
			if (element.$dirty && element.$valid) {
				className += 'has-success';
			}
			return className;
		}
	}
});




////////////////////// FILTERS ////////////////////

timeOff.filter('capitalize', function() {
  return function(input, scope) {
    if (input!=null)
	return input.replace(/\w\S*/g, function(txt){
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	}); 
    // input = input.toLowerCase();
    // return input.substring(0,1).toUpperCase()+input.substring(1);
  }
});
