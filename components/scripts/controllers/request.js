timeOff.controller('requestController',
	['$scope', '$rootScope', '$location', '$filter', '$timeout', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', 'AllDatesBetweenTwoDatesToArray', 
	function ($scope, $rootScope, $location, $filter, $timeout, $firebaseArray, $firebaseObject, FIREBASE_URL, AllDatesBetweenTwoDatesToArray) {
		
        $rootScope.pageName = 'request';
        var ref = new Firebase(FIREBASE_URL);
        var numberDays;
        $scope.takenDates = [];
        $scope.requestFormDisplay = true;
        
        function numberOfWeeksInDaysLength (numberOfDays) {
            if(numberOfDays!==null || !isNaN(numberOfDays)) {
                var weekCount = numberOfDays % 5;
                if(weekCount===0) {
                    return Math.round(numberOfDays / 5);
                }
            } else {
                return 0;
            }
        }
              
        
        function numberDaysOffBetweenDates (startDate, endDate) {
            //caclulate num of days requested between & including start and end,
            //it's a business week, so disregard weekends.
            if(startDate && endDate) {
                var elapsed, daysBeforeFirstSunday, daysAfterLastSunday;
                var ifThen = function (a, b, c) {
                    return a == b ? c : a;
                };
            
                elapsed = endDate - startDate;
                elapsed /= 86400000;
            
                daysBeforeFirstSunday = (7 - startDate.getDay()) % 7;
                daysAfterLastSunday = endDate.getDay();
            
                elapsed -= (daysBeforeFirstSunday + daysAfterLastSunday);
                elapsed = (elapsed / 7) * 5;
                elapsed += ifThen(daysBeforeFirstSunday - 1, -1, 0) + ifThen(daysAfterLastSunday, 6, 5);
            
                return Math.ceil(elapsed);
            }
        }
        
        function isSomeRequestAlreadyTaken(haystack, arr) {
            return arr.some(function (v) {
                return haystack.indexOf(v) >= 0;
            });
        }
        
        $scope.closeAlert = function() {
            $scope.message = null;
        };
        
        $scope.restoreForm = function() {
            $scope.closeAlert();
            $scope.requestFormDisplay = true;
        }
        
        //if user account is disabled, kick to main page
        //and display disabled account msg
        $scope.$watch('currentUser.status', function() {
			if($rootScope.currentUser.status!=='enabled') {
				$location.path('/schedule');
			}
		});
        
        //we need a lastLogindate!==undefined so to set the proper calendar
        //instead of using the local systems calendar.
        //if user refreshes the page we lose the lastLoginDate, so we are
        //redirecting as a quickfix, where lastLoginDate gets picked up again
	    if($rootScope.currentUser && $rootScope.currentUser.hasOwnProperty('status') && $rootScope.currentUser.hasOwnProperty('lastLoginDate')) {
            
            $scope.$watchGroup(['currentUser.eligibleDays', 'currentUser.pendingDays'], function () {
                
                var availableNowDays = $rootScope.currentUser.eligibleDays - $rootScope.currentUser.approvedDays - $rootScope.currentUser.pendingDays;
                
                // chart data        
                $scope.stats = {
                    "approvedDays" : $rootScope.currentUser.approvedDays,
                    "pendingDays" : $rootScope.currentUser.pendingDays,
                    "availableNow" : (availableNowDays > 0) ? availableNowDays : 0
                };
                
                
                var chartConfig = {
                        "labels": [
                            "Days taken: " + $scope.stats.approvedDays, 
                            "Days pending review: " + $scope.stats.pendingDays,
                            "Days available now for request: " + $scope.stats.availableNow,
                            "Days eligible per year: " + $rootScope.currentUser.eligibleDays 
                            ],
                        "data": [
                            $scope.stats.approvedDays,
                            $scope.stats.pendingDays,
                            $scope.stats.availableNow,
                            ""
                            ],
                        "colors": ["#4bbf25", "#80b9f8", "#dadada", "#ffffff"],
                        "options": {
                            tooltipTemplate: function(label) {
                                return label.label;
                            }
                        }
                    };
                $scope.chart = chartConfig;
            });
            
            
            //calendar datepicker config
            $scope.initDate = new Date($filter('date')($rootScope.currentUser.lastLoginDate, 'MMMM dd, yyyy', '-0500'));
            
            $scope.eligibleWeeks = ($rootScope.currentUser.eligibleDays / 5).toFixed(1);
            
            $scope.clearCalendar = function (str) {
                $scope.request[str] = null;
            };
            
		    //TODO:let admin control these values in settings page
            var daysInAdvanceMinimumRequest = 3;
            var daysInAdvanceMaximumRequest = 365;
            
            var absoluteMinDate = new Date(+$rootScope.currentUser.lastLoginDate + daysInAdvanceMinimumRequest*86400000);
            var absoluteMaxDate = new Date(+$rootScope.currentUser.lastLoginDate + daysInAdvanceMaximumRequest*86400000);
            $scope.toDateMinDate = $scope.fromDateMinDate = $scope.oneDateMinDate = absoluteMinDate;
            $scope.toDateMaxDate = $scope.fromDateMaxDate = $scope.oneDateMaxDate = absoluteMaxDate;
            
            $scope.$watch('request.len', function() {
                if($scope.request.len==='oneDay') {
                    $scope.numberDays = 1;
                }
                if ($scope.request.len==='multipleDays') {
                    if(!isNaN(numberDays)) {
                        $scope.numberDays = numberDays;
                    }
                } 
            });
            
            
            $scope.$watch('request.fromDate', function() {
                if($scope.request && $scope.request.hasOwnProperty('fromDate')) {
                    // make minimum until date one day after user chosen from date
                    // e.g. user selects Jul 28 in the from field,
                    // automatically the until field can choose ONLY from Jul 29 and on
                    $scope.toDateMinDate = new Date($scope.request.fromDate);
                    $scope.toDateMinDate.setDate($scope.toDateMinDate.getDate() + 1);

                    if($scope.request.fromDate===null) {
                        $scope.toDateMinDate = absoluteMinDate;
                        $scope.request.toDate = null;
                        numberDays = 0;
                        $scope.numberDays = numberDays;
                        $scope.numberWeeks = numberOfWeeksInDaysLength($scope.numberDays);
                    }
                    
                    if($scope.request.fromDate!==null && $scope.request.toDate!==null) {
                        var fromDate = new Date($scope.request.fromDate);
                        var toDate = new Date($scope.request.toDate);
                        
                        if(fromDate>toDate) {
                            $scope.request.toDate = null;
                        }
                        
                        numberDays = numberDaysOffBetweenDates($scope.request.fromDate, $scope.request.toDate);
                        $scope.numberDays = (numberDays > 0) ? numberDays : null;
                        $scope.numberWeeks = numberOfWeeksInDaysLength($scope.numberDays);
                    }
                }
            });
            
            //Calculate how many days user requests off, including the last day
            $scope.$watch('request.toDate', function() {
                if($scope.request && $scope.request.hasOwnProperty('toDate')) {
                    if($scope.request.fromDate!==null) {
                        if ($scope.request.toDate!==null) {
                            numberDays = numberDaysOffBetweenDates($scope.request.fromDate, $scope.request.toDate);
                            $scope.numberDays = (numberDays > 0) ? numberDays : null;
                            $scope.numberWeeks = numberOfWeeksInDaysLength($scope.numberDays);
                        }
                        if ($scope.request.toDate===null) {
                            numberDays = null;
                            $scope.numberDays = numberDays;
                            $scope.numberWeeks = numberOfWeeksInDaysLength($scope.numberDays);
                        }
                    }
                }
            });
            
            // Disable weekend selection & already approved days
            // Populate array with dates "yyy-mm-dd" from
            // schedule view when a request is approved
            var syncData = $firebaseObject(ref.child('sync/takenDays'));
	        syncData.$watch(function(data) {
                ref.child('sync/takenDays').on("value", function(snapshot) {
                    var datesTaken = snapshot.val();
                    for(var dayTaken in datesTaken) {
                        if(datesTaken.hasOwnProperty(dayTaken)) {
                            $scope.takenDates.push(datesTaken[dayTaken].toString());
                        }
                    }
                });
                
                $scope.disabled = function(date, mode) {
                    if($rootScope.currentUser.hasOwnProperty('blockCalendar') && $rootScope.currentUser.blockCalendar===false) {
                        return mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 );
                    } else {
                        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 || 
                        $scope.takenDates.indexOf( $filter('date')(date, 'yyyy-MM-dd') ) !== -1 ) );
                    }
                };
            });
            
        } else {
            /*
            on refresh, currentUser.lastLoginDate becomes undefined.
            Thus, if user refreshes, dont crash the calendar;
            take him back to main page, instead.
            If user navigates normally it picks up
            currentUser.lastLoginDate again from db
            */
            $location.path('/schedule');
        }
        
	    //on request submission
		$scope.request = function() {
            
            $('#confirmRequest').modal('toggle');
            
            $timeout(function() {
                $('html, body').animate({scrollTop: 0}, 1400);
            }, 100);
            
            //Make sure in-between dates doesnt overlap already booked dates.
            //Also, datepicker disable dates isnt dynamic, so maybe another
            //booking happened during this time, so double-check this as well before submit
            var from, until;
            if($scope.request.len==='oneDay') {
                from = until = $scope.request.oneDate;
            } else {
                from = $scope.request.fromDate;
                until = $scope.request.toDate;
            }
            
            var requestedDates = AllDatesBetweenTwoDatesToArray(from, until);
            
            var daysAllowed = $rootScope.currentUser.eligibleDays - $rootScope.currentUser.approvedDays - $rootScope.currentUser.pendingDays;
            
            //show errormsg if user is asking for more days than allowed or
            //if user daysAllowed are negative (her elegibleDays were decreased by an admin)
            if(daysAllowed <= 0) {
                
               $scope.message = "ERROR: You are requesting " + $scope.numberDays +
                                " days but you don't have any more days available for request.";
                
            //asking for more than available    
            } else if($scope.numberDays > daysAllowed) {
               
               $scope.message = "ERROR: You are requesting " + $scope.numberDays +
                                " days but you have " + daysAllowed +
                                " days available for request.";
                
            // else if dates requested overlap
            } else if($rootScope.currentUser.hasOwnProperty('blockCalendar') && $rootScope.currentUser.blockCalendar!==false && isSomeRequestAlreadyTaken($scope.takenDates, requestedDates)) {
                
                $scope.message = "ERROR: Some days overlap with a request already granted. Please check again.";
                
            //process as normal
            } else {
                
                //prepare requestObject to add to db
                var requestData = {
                    reason: $scope.request.reason,
                    len: $scope.request.len,
                    notes: $scope.request.notes || "",
                    numberDays: $scope.numberDays || "",
                    numberWeeks: $scope.numberWeeks || "",
                    status: "Pending",
                    userId: $rootScope.currentUser.$id,
                    date: Firebase.ServerValue.TIMESTAMP
                };
                
                requestData.from = $filter('date')(from, 'yyyy-MM-dd');
                requestData.until = $filter('date')(until, 'yyyy-MM-dd');
                
                var requestUser = ref.child('users/' + $rootScope.currentUser.$id + '/requests/');
                var requestInfo = $firebaseArray(requestUser);
                
                requestInfo.$add(requestData).then(function(requestPath) {
                    
                    //add counter that tells scheduler there is new info, so scheduler will sync realtime
                    ref.child('sync/schedule/requests/pendingApproval').transaction(function (current_value) {
                        return (current_value || 0) + 1;
                    });
                    
                    //request path that syncs with Zapier to trigger automatic delivery of confirmation email - It only keeps the latest request info, no need for history
                    var personalizedText = "Hello from TimeOff.\n\nThis message is to confirm that " + $rootScope.currentUser.firstName + " " + $rootScope.currentUser.lastName + " placed a new request\nFrom: " + requestData.from + "\nUntil: " + requestData.until + ".\n\nIf you are the admin/manager, please log in to approve or decline this request.\n\nThank you.";
                    
                    var sendEmailObj = {
                        "from" : requestData.from,
                        "until" : requestData.until,
                        "email" : $rootScope.currentUser.email,
                        "by" : $rootScope.currentUser.firstName + " " + $rootScope.currentUser.lastName,
                        "text" : personalizedText
                    };
                    ref.child('push/latestRequest/').update(sendEmailObj);
                                       
                    //increase pending days, so user can't request more than allowed even though
                    //she has enough official remaining days - This is to preven overrequesting by a single user.
                    ref.child('users/' + $rootScope.currentUser.$id + '/pendingDays').transaction(function (current_value) {
                        return (current_value || 0) + $scope.numberDays;
                    });
                    
                    var requestId = requestPath.path.o[3];
                    requestUser.child(requestId).update({"requestId": requestId});
                    
                    $scope.message = "Your request was submitted succesfully!";
                    //clear fields to accept new request without leaving page
                    $scope.request.reason = "";
                    $scope.request.len = "";
                    $scope.request.fromDate = "";
                    $scope.request.toDate = "";
                    $scope.request.notes = "";
                    
                    $scope.requestFormDisplay = false;
                    
                }).catch(function (error) {
                    $scope.message = "ERROR: There was a problem submitting your request.";
                    // $scope.message = error.message;
                });
                
            }//end test if errors
            
		};
}]);
