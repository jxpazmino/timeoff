timeOff.controller('scheduleController', ['$scope', '$rootScope', '$timeout', '$firebaseObject', 'FIREBASE_URL', '$filter', 'AllDatesBetweenTwoDatesToArray', function ($scope, $rootScope,$timeout, $firebaseObject, FIREBASE_URL, $filter, AllDatesBetweenTwoDatesToArray) {
	

	function drawScheduler(dp) {
		
		ref.child('users').once("value", function(snapshot) {
			
			// All location and users data  will be populated here
			// This is the template for people sorted by locations
			//
			// dp.resources = [
			// 			{ name: "Office-1", id: "G1", expanded: true, children:[
			// 					{ name : "Person 1", id : "A" },
			// 					{ name : "Person 2", id : "B" },
			// 					{ name : "Person 3", id : "C" },
			// 					{ name : "Person 4", id : "D" }
			// 					]
			// 			},
			// 			{ name: "Office-2", id: "G2", expanded: true, children:[
			// 					{ name : "Person 1", id : "E" },
			// 					{ name : "Person 2", id : "F" },
			// 					{ name : "Person 3", id : "G" },
			// 					{ name : "Person 4", id : "H" }
			// 					]
			// 			}
			// 		];
			//
			// or only people, no locations:
			//
			// dp.resources = [
			// 			{ name: "Person-1", id: "G1" },
			// 			{ name: "Person-2", id: "G2" }
			// 		];
			dp.resources = [];
			
			
			// Template for events array:
			// dp.events.list = [
			// 	{
			// 		start: "2015-12-24T12:00:00",
			// 		end: "2015-12-27T12:00:00",
			// 		id: 1,
			// 		resource: "FirstName1 LastName1",
			// 		text: "Vacation",
			// 		type: "disabled"
			// 	},
			// 	{
			// 		start: "2015-12-22T12:00:00",
			// 		end: "2015-12-31T12:00:00",
			// 		id: 2,
			// 		resource: "FirstName2 LastName2",
			// 		text: "Event 1"
			// 	}
			// ];
			dp.events.list = [];
			
			var values = snapshot.val();
			for (var val in values) {
				if(values.hasOwnProperty(val)) {
					if(values[val].status=="enabled") { // && values[val].email!=='jonathan@itglobalprotech.com'
						var userName = values[val].firstName + " " + values[val].lastName;
						var userObj = { name: userName, id: userName};
						dp.resources.push(userObj);
						
						if(values[val].hasOwnProperty("requests")) {
							var j = 0;
							for (var request in values[val].requests) {
								if (values[val].requests.hasOwnProperty(request)) {
									var requestInfo = values[val].requests[request];
									
									//adding very early start and late end time to make sure event fills entire day
									var requestFrom = requestInfo.from + "T05:00:00";
									var requestUntil = requestInfo.until + "T21:00:00";
									
									var eventObject = {
										start: requestFrom,
										end: requestUntil,
										id: j,
										resource: userName,
										text: requestInfo.reason,
										type: 'disabled',
										numberDays: requestInfo.numberDays,
										numberWeeks: requestInfo.numberWeeks,
										len: requestInfo.len,
										notes: requestInfo.notes,
										status: requestInfo.status,
										requestId: requestInfo.requestId,
										userId: requestInfo.userId,
										date: requestInfo.date
									};
									
									dp.events.list.push(eventObject);
									
									j++;
								}
							}
						}
					}
					
				}
			}
			
			var today = new Date();
		
			//if want scheduler to display from today then = 0;
			var daysToDisplayBeforeToday = 0;
			
			today.setDate(today.getDate() - daysToDisplayBeforeToday);
			var todayDisplayDay = today.getFullYear() + "-" + ("0" + (today.getMonth() + 1) ).slice(-2) + "-" + ("0"+today.getDate()).slice(-2);
		
			dp.startDate = "2016-04-01";//$filter('date')($rootScope.currentUser.lastLoginDate, 'yyyy-MM-dd', '-0500') || todayDisplayDay;//example://"2015-12-07";
			dp.days = 365;
			dp.scale = "Day";
			dp.timeHeaders = [
				{ groupBy: "Month", format: "MMM yyyy" },
				{ groupBy: "Cell", format: "ddd d" }
			];
		
			dp.bubble = new DayPilot.Bubble();
			dp.resourceBubble = new DayPilot.Bubble();
		
			dp.contextMenu = new DayPilot.Menu({items: [
				{text:"Edit", onclick: function() { dp.events.edit(this.source); } },
				{text:"Delete", onclick: function() { dp.events.remove(this.source); } },
				{text:"-"},
				{text:"Select", onclick: function() { dp.multiselect.add(this.source); } },
			]});
		
			// dp.eventDeleteHandling = "Update"; // do something here later to delete events
					
		
			dp.eventMovingStartEndEnabled = false;
			dp.eventResizingStartEndEnabled = false;
			dp.timeRangeSelectingStartEndEnabled = false;
		
			
		
			// dp.onBeforeResHeaderRender = function(args) {
			// 	args.resource.bubbleHtml = "Time";
			// };
		
			dp.onBeforeRowHeaderRender = function(args) {
			};
		
			dp.onBeforeCellRender = function(args) {
				if (args.cell.start <= DayPilot.Date.today() && DayPilot.Date.today() < args.cell.end) {
					args.cell.backColor = "#ffcccc";
				}
			};
		
			dp.onEventMove = function(args) {
				return false;
			};
		
			dp.onEventMoved = function (args) {
				return false;
			};
		
			dp.onEventClicked = function(args) {	
				return false;
			};
		
			dp.onEventMoving = function(args) {
				return false;
			};
		
			dp.onEventResize = function(args) {
				return false;
			};

			dp.onEventResized = function (args) {
				return false;
			};
		
			dp.onTimeRangeSelecting = function(args) {
				return false;
			};
		
			dp.onTimeRangeSelected = function (args) {
				return false;
			};
		
			// dp.separators = [
			// 	{color:"Red", location:"2016-01-01T00:00:00", layer: "BelowEvents"}
			// ];
			
			// dp.scrollTo("2016-03-25");
			
			///////////////////////////////////////////////////////
			// pass event info to side view for admin to approve
			// $scope isnt gluing so using jQuery
			// TODO: make it angular instead of jQuery
			///////////////////////////////////////////////////////
			dp.onEventClicked = function(args) {
				$('#requestViewRequestDate').val($filter('date')(args.e.data.date, 'MMM dd, yyyy hh:mm:ss a', '-0500'));
				$('#requestViewUser').val(args.e.data.resource);
				$('#requestViewUserId').val(args.e.data.userId);
				var requestId = $('#requestViewRequestId').val(args.e.data.requestId);
				$('#requestViewNumberDays').val(args.e.data.numberDays);
				$('#requestViewFromDate').val($filter('date')(args.e.data.start, 'MMM dd, yyyy', '-0500'));
				$('#requestViewUntilDate').val($filter('date')(args.e.data.end, 'MMM dd, yyyy', '-0500'));
				$('#requestViewReason').val(args.e.data.text);
				$('#requestViewNotes').val(args.e.data.notes);
				$('#requestViewStatus').val(args.e.data.status);
				
				if($('#requestViewStatus').val()==='Pending') {
					actionButtons.show();
				} else {
					actionButtons.hide();
				}
			};
		
			/////////////////start config///////////////////////
			dp.allowMultiResize = false;
			dp.businessBeginsHour = 4;
			dp.businessEndsHour = 22;
			dp.businessWeekends = false;
			dp.cellWidth = 56;
			dp.crosshairType = "Header";
			dp.eventStackingLineHeight = 90;
			dp.eventHeight = 36;
			dp.eventMoveHandling = 'Disabled';
			dp.eventResizeHandling = 'Disabled';
			dp.eventSelectHandling = 'Disabled';
			dp.eventDeleteHandling = 'Disabled';
			dp.eventRightClickHandling = 'Disabled';
			dp.height = 540;
			dp.heightSpec = "Max";
			dp.rowClickHandling = 'Disabled';
			dp.rowSelectHandling = 'Disabled';
			dp.showNonBusiness = false;
			dp.theme = "scheduler_giallo";
			dp.treeEnabled = false;
			dp.treePreventParentUsage = true;
			/////////////////////end///////////////////////////
			
			dp.onBeforeEventRender = function(args) {
				args.e.bubbleHtml = "<div><b>" + args.e.text + "</b></div><div>Start: " + new DayPilot.Date(args.e.start).toString("M/d/yyyy") + "</div><div>End: " + new DayPilot.Date(args.e.end).toString("M/d/yyyy") + "</div><div><b>(" + args.data.status + ")</b></div>";
				
				switch (args.data.status) {
					case 'Approved':
						args.data.cssClass = "eventApproved";
						break;
					case 'Declined':
						args.data.cssClass = "eventDeclined";
						break;
					case 'Pending':
						args.data.cssClass = "eventPending";
						break;
					default:
						break;
				}
			};			
			
		}, function (errorObject) {
			$('#dp').text("Scheduler read error. Please try login in again.");
		});
		
		return dp;
		
	}
	
	$rootScope.pageName = 'schedule';
	//prevent requestslist controller to override pagename thus affecting the active tab color
	$scope.$watch('pageName', function() {
		if($rootScope.pageName === 'requestslist') {
			$rootScope.pageName = 'schedule';
		}
	});
	
	//prevent side panel & notifications to display before schedule panel loads
	var requestViewDetails = $('#requestViewDetails');
	requestViewDetails.hide().siblings('#welcomeInfo', '#requestViewActionButtons').hide();
	var actionButtons = requestViewDetails.find('#requestViewActionButtons');
	actionButtons.hide().children().eq(1).hide();
	var $notifications = $('#requestViewNotifications');
	
	//use server time to show schedule, prevent local(computer) time use
	if($rootScope.currentUser && $rootScope.currentUser.hasOwnProperty('lastLoginDate')) {
		$scope.initDate = new Date($filter('date')($rootScope.currentUser.lastLoginDate, 'yyyy-MM-dd', '-0500'));
	}
	
	var ref = new Firebase(FIREBASE_URL);
	var dp = new DayPilot.Scheduler("dp");
	var dpScheduler = drawScheduler(dp);
	
	
	// function getEvents(ref) {
	// 	var requestslist = [];
	// 	ref.child('users').on("value", function(snapshot) {
	// 		var userslist = snapshot.val();
	// 		var j = 0;
			
	// 		for(var user in userslist) {
	// 			if(userslist.hasOwnProperty(user)) {
	// 				if(userslist[user].hasOwnProperty("requests")) {
	// 					for(var request in userslist[user].requests) {
	// 						var requestInfo = userslist[user].requests[request];
	// 						requestInfo.firstName = userslist[user].firstName;
	// 						requestInfo.lastName = userslist[user].lastName;
							
	// 						var requestObj = {
								
	// 							"start": requestInfo.from,
	// 							"end": requestInfo.until,
	// 							"id": j,
	// 							"resource": requestInfo.firstName + " " + requestInfo.lastName,
	// 							"text": requestInfo.reason,
	// 							"type": 'disabled',
	// 							"numberDays": requestInfo.numberDays,
	// 							"numberWeeks": requestInfo.numberWeeks,
	// 							"len": requestInfo.len,
	// 							"notes": requestInfo.notes,
	// 							"status": requestInfo.status,
	// 							"requestId": requestInfo.requestId,
	// 							"userId": requestInfo.userId
	// 						}
							
	// 						requestslist.push(requestObj);
	// 						j++;
	// 					}
	// 				}
	// 			}
	// 		}
	// 		userslist = null;
	// 	});
	// 	return requestslist;
	// }
	
	
	//loads scheduler from usersData once
	var usersData = $firebaseObject(ref.child('users'));
	usersData.$loaded().then(function(event) {
		dpScheduler.init();
		requestViewDetails.show();
		requestViewDetails.siblings('#welcomeInfo').show();
	});
	
	
	//redraws scheduler each time there is change in synData branch in db
	var syncData = $firebaseObject(ref.child('sync/schedule'));
	syncData.$watch(function(data) {
		var dpcontainer = $('#dp-container');
		dpcontainer.children().remove();
		dpcontainer.append('<div id="dp"></div>');
		dpScheduler = drawScheduler(dp);
		dpScheduler.init();
		
		// var arrayOfEvents = getEvents();
		// console.log(arrayOfEvents);
		// dpremap.events.list = arrayOfEvents;
		
		
		/*var e = new DayPilot.Event({
            // start: new DayPilot.Date("2013-03-25T00:00:00"),
            // end: new DayPilot.Date("2013-03-25T12:00:00"),
            // id: DayPilot.guid(),
            // resource: String.fromCharCode(65+i),
            // text: "Event",
            // bubbleHtml: "Testing bubble"
			
			
			
			start: new DayPilot.Date("2016-03-22T05:00:00"),
			end: new DayPilot.Date("2016-03-25T21:00:00"),
			id: DayPilot.guid(),
			resource: "Andrew Roberts",
			text: "Sick",
			type: 'disabled',
			numberDays: 4,
			numberWeeks: 0,
			len: "multipleDays",
			notes: "notes notes notes",
			status: "Pending",
			requestId: "somenumber",
			userId: "anothernumber"
        });
        dpScheduler.events.add(e);*/
		
		
		
		$rootScope.pendingApprovalRequests = syncData.requests.pendingApproval;
		
		$('#notificationsContainer').css('width', 311*$rootScope.pendingApprovalRequests + 'px');
		
		// if($rootScope.pendingApprovalRequests > 0) {
		// 	$notifications.show();
		// }
	});
	
	$scope.processNotificationRequest = function(request) {
		
		$('#requestViewRequestDate').val($filter('date')(request.date, 'MMM dd, yyyy hh:mm:ss a', '-0500'));
		$('#requestViewUser').val(request.firstName + " " + request.lastName);
		$('#requestViewUserId').val(request.userId);
		$('#requestViewRequestId').val(request.requestId);
		$('#requestViewNumberDays').val(request.numberDays);
		$('#requestViewFromDate').val($filter('date')(request.from, 'MMM dd, yyyy'));//'EEE, MMM d, yyyy', '-0500'
		$('#requestViewUntilDate').val($filter('date')(request.until, 'MMM dd, yyyy'));
		$('#requestViewReason').val(request.reason);
		$('#requestViewNotes').val(request.notes);
		$('#requestViewStatus').val(request.status);
				
		if($('#requestViewStatus').val()==='Pending') {
			actionButtons.show();
		} else {
			actionButtons.hide();
		}
		dpScheduler.scrollTo($filter('date')(request.from, 'yyyy-MM-dd'), true, false);
	}
		
	//Admin actions on request events
	$scope.updateStatus = function(action) {
		
		function slideRequests() {
			var requestI = $('#requestViewRequestId').val();
			$('#request' + requestI)
				.hide(550)
				.animate({ "margin-left": "-305px" }, 600);
		}
		
		function updateRequestsQueue() {
			return $timeout(function() {
				ref.child('sync/schedule/requests/pendingApproval').transaction(function (current_value) {
					return (current_value || 0) - 1;
				});
			}, 1000);
		}
		
		function processRequest(action) {
			
			return $timeout(function() {
				
				//since we are processing the request, hide the action buttons and show a "Updating" status
				actionButtons.children().eq(0).hide().next().show();
				
				var userId = $('#requestViewUserId').val();
				var requestId = $('#requestViewRequestId').val();
				
				//change status to approved or declined
				ref.child('users/' + userId + '/requests/' + requestId + "/").update({status : action});
				
				//if Approved we need to perform two things:
				//1. retrieve information of user that made this request and update her approvedDays entry in db
				//2. enter dates requested in "approved" pool of dates, so nobody else can request same date in pool - these dates will be disabled in datepicker
				var requestedDays = parseInt($('#requestViewNumberDays').val());
				
				if(action==='Approved') {
					//1.
					ref.child('users/' + userId + '/approvedDays').transaction(function (current_value) {
						return (current_value || 0) + requestedDays;
					});	
					
					//2.
					var from = $('#requestViewFromDate').val();
					var until = $('#requestViewUntilDate').val();
					
					var datesArray = AllDatesBetweenTwoDatesToArray(from, until);
					var obj = {};
					for (var i = 0; i < datesArray.length; i ++ ) {
						obj[datesArray[i]] = datesArray[i];
					}
					ref.child('sync/takenDays/').update(obj);
					obj = null;
				}
				
				//Whether approved or not:
				//1. remove from pending queue in sync entry in db, this triggers notifications update in mainpage
				
				
				//2. deduct from pendingDays in db
				ref.child('users/' + userId + '/pendingDays').transaction(function (current_value) {
					return (current_value || 0) - requestedDays;
				});
				
				$timeout(function() {
					//reset "approved/declined" button view and have it ready for a future event click
					//show status to user: 'Approved' or 'Declined'
					$('#requestViewStatus').val(action);
					//reset:bring back actions buttons and disregard "Updating" status
					actionButtons.children().eq(0).show().next().hide();
					//hide action button section and be ready for next round
					actionButtons.hide();
				}, 1000);
				
			}, 600);
		}
		
		if($('#requestViewStatus').val()==='Pending') {
			
			slideRequests();
			updateRequestsQueue();
			processRequest(action);
			
		} else {
			return false;
		}
		
	};
	
	$(document).ready(function() {
		$('#schedulerLegend > li:last-child').on('click', function () {
			$notifications.slideToggle(300);
		});
	});
	
}]);
