'use strict';

/* Controllers */

angular.module('myApp.controllers', ['myApp.services'])
  .controller('MyCtrl1', ['$scope', function($scope) {


  }])

  .controller('AddNoteController', ["$scope", function($scope) {

  	$scope.saveNote = function() {
  		var e = {
  			type: "note",
  			date: new Date(),
  			text: $scope.note
  		};

  		$scope.job.events.push(e);

  		$scope.job.$save();
  		$scope.deactivateAction();
  	}
  }])

  .controller('EnterCustomerController', ["$scope", function($scope) {

  	$scope.saveCustomer = function() {
  		$scope.job.customer = $scope.customer;
  		$scope.job.$save();
  		$scope.deactivateAction();
  	}

  }])

  .controller('EnterBoatController', ["$scope", function($scope) {

  	$scope.saveBoat = function() {
  		$scope.job.boat = $scope.boat;
  		$scope.job.$save();
  		$scope.deactivateAction();
  	}

  }])

  .controller('EnterInspectorController', ["$scope", function($scope) {

  	$scope.saveInspector = function() {
  		$scope.job.inspector = $scope.inspector;
  		$scope.job.$save();
  		$scope.deactivateAction();
  	}

  }])

  .controller('JobsController', ['$scope', 'job', "process", "$rootScope", "$location", function($scope, job, process, $rootScope, $location) {

  	$rootScope.pageTitle = "Jobs";
  	$scope.jobs = job.query();


  	$scope.jobs.$promise.then(function() {
	  	for(var i in $scope.jobs) {
	  		var j = $scope.jobs[i];
	  		var stepsDone = [];

	  		for (var k in j.events) {
	  			if (j.events[k].id)
	  				stepsDone.push(j.events[k].id);
	  		}
	  		j.stepsDone = stepsDone;
	  		j.totalSteps = process.steps.slice(stepsDone.length);

	  	}

  	})

  	$scope.addNewJob = function() {

  		var currentLargestJobNumber = 0;
  		for(var i in $scope.jobs) {
  			if ($scope.jobs[i].jobNumber)
  				currentLargestJobNumber = Math.max(currentLargestJobNumber, parseInt($scope.jobs[i].jobNumber));
  		}

  		var j = new job({
  			jobNumber: currentLargestJobNumber+1,
  			events: [{
				id: "jobCreated",
				title: "Job request received",
				date: new Date()
			}
  			]
  		});
  		j.$save();
  		$location.url("/jobs/" + j.jobNumber);
  	};

  }])

  .controller("JobController", ["$scope", "thisJob", "process", "$rootScope", "actions", function($scope, job, process, $rootScope, actions) {

  	$rootScope.pageTitle = "Job " + job.jobNumber;

  	$scope.$watch(function update() {
	  	var steps = process.steps.slice();

	  	var happenedSteps = [];
	  	for(var i in job.events) {
	  		var e = job.events[i];
	  		if(e.id) {
	  			happenedSteps.push(e.id);
	  		}
	  	}

	  	// For each required step, mark it as happened or not.
	  	for(var i in steps) {
	  		steps[i].done = happenedSteps.indexOf(steps[i].id) > -1;
	  	}

	  	var firstNotDone = steps.findIndex(function(s) { return !s.done; });

	  	if (firstNotDone > -1) {
	  		$scope.pendingSteps = steps.slice(firstNotDone);
	  	} else {
	  		$scope.pendingSteps = [];
	  	}

	  	$scope.actions = [];
	  	for(var i in actions) {
	  		var a = actions[i];
	  		if (a.predicate(job))
	  			$scope.actions.push(a);
	  	}


	});

  	$scope.job = job;


  	$scope.activateAction = function(a) {

  		if (a.templateUrl)
  			$scope.activeActionTemplateUrl = a.templateUrl;

  		if (a.onActivate)
  			a.onActivate($scope);
  	};

  	$scope.deactivateAction = function() {
  		$scope.activeActionTemplateUrl = null;
  	}


  	$scope.markDone = function(id) {

  		if (!id)
  			return;

  		job.events = job.events || [];
  		var e = JSON.parse(JSON.stringify(process.steps.find(function(s) { return s.id == id; })));
  		e.date = new Date();

  		job.events.push(e);

  		job.$save();
  	}

  	$scope.removeEvent = function(i) {
  		if (i == null || i == 0) // Do not allow removing first event!
  			return;

  		if (window.confirm("Are you absolutely, definitely, completely sure you wish to remove this event? This cannot be undone.")) {
	  		job.events.splice(i,1);
	  		job.$save();
  		}

  	}

  	$scope.cancelNote = function() {
  		$scope.newNoteText = "";
  		$scope.showNoteForm = false;
  	}

  	$scope.saveNote = function() {

  		var e = {
  			type: "note",
  			date: new Date(),
  			text: $scope.newNoteText
  		};

  		job.events.push(e);

  		job.$save();

  		$scope.newNoteText = "";
  		$scope.showNoteForm = false;

  	}

  }])
