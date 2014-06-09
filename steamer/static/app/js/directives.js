'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])

  .directive('jobsTable', ["$location", function($location) {
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

		  	scope.setOrderBy = function(field) {
		  		scope.orderDir = (scope.orderField == field ? !scope.orderDir : scope.orderDir); 
		  		scope.orderField = field;
		  	}  		
		},
  	}
  }])
