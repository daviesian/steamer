'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])

  .directive('jobsTable', ["$location", "process", function($location, process) {
  	return {
  		restrict: "E",

  		scope: {
  			jobs: "=",
  		},

  		templateUrl: "partials/jobsTable.html",

  		link: function(scope, element, attrs) {

		  	scope.go = function(job) {
		  		$location.url("/jobs/" + job.jobNumber);
		  	}

        scope.orderDir = true;
        scope.orderField = "jobNumber";

		  	scope.setOrderBy = function(field) {
		  		scope.orderDir = (scope.orderField == field ? !scope.orderDir : scope.orderDir); 
		  		scope.orderField = field;
		  	}

        scope.processSteps = process.steps;

        scope.$watchCollection("jobs", function() {
          for (var i in scope.jobs) {
            var j = scope.jobs[i];

            //j.processSteps = {};
            //for(var i in process.steps) {
            //  j.processSteps[process.steps[i].id] = j.stepsDone.indexOf(process.steps[i].id) > -1
            //}
            var stepsCompleted = process.steps.length;
            for (var i in process.steps) {
              if (j.stepsDone.indexOf(process.steps[i].id) == -1){
                stepsCompleted = i;
                break;
              }
            }

            j.percent = (100*stepsCompleted / process.steps.length) + "%";

            if (stepsCompleted > 0) {
              j.relax = !!process.steps[stepsCompleted-1].relax;
            }
            j.complete = stepsCompleted == process.steps.length
          }

        });

      },
  	}
  }])
