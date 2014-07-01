'use strict';

/* Controllers */

angular.module('myApp.controllers', ['myApp.services'])
  .controller('MyCtrl1', ['$scope', function($scope) {


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

  .controller('JobsController', ['$scope', 'job', "process", "$rootScope", "$location", "$filter", function($scope, job, process, $rootScope, $location, $filter) {

  	$rootScope.pageTitle = "Jobs";

  	$scope.jobsLoader = job.query();// = $filter('filter')(job.query(), {open:true}, true);
  	$scope.orderField = "jobNumber";
  	$scope.orderDir = true;


  	$scope.jobsLoader.$promise.then(function() {
	  	$scope.jobs = $scope.jobsLoader.slice();
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

	  	$scope.openJobs = $filter('filter')($scope.jobs, function(j) {
	  		return !j.closed;
	  	});
	  	$scope.closedJobs = $filter('filter')($scope.jobs, {closed:true});

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

      var lastStep = happenedSteps[happenedSteps.length - 1];
      var lastStepIndex = steps.findIndex(function(s) { return lastStep == s.id; });

      var firstNotDone = lastStepIndex + 1;

      if (firstNotDone == steps.length) {
        $scope.pendingSteps = [];
      } else {
        $scope.pendingSteps = steps.slice(firstNotDone);
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

    $scope.addingNote = {index: -1, note: null};

    $scope.addNote = function(index) {
      var e = {
        type: "note",
        date: new Date(),
        text: $scope.addingNote.note
      };

      $scope.job.events.splice($scope.addingNote.index+1,0,e);

      $scope.job.$save();
      $scope.addingNote.index = -1;
      $scope.addingNote.note = null;
    }


    $scope.deleteNote = function(index) {
      if (!window.confirm("This will delete the note from this job. Are you sure?"))
        return;
      $scope.job.events.splice(index,1);
      job.$save();
    }

    $scope.deleteCustomer = function() {
      if (!window.confirm("This will delete the customer details from this job. Are you sure?"))
        return;
      $scope.job.customer = "";
      job.$save();
    }

    $scope.deleteBoat = function() {
      if (!window.confirm("This will delete the boat details from this job. Are you sure?"))
        return;
      $scope.job.boat = "";
      job.$save();
    }

    $scope.deleteInspector = function() {
      if (!window.confirm("This will delete the inspector details from this job. Are you sure?"))
        return;
      $scope.job.inspector = "";
      job.$save();
    }

  }])
