'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'ngResource',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
]).
config(['$routeProvider', function($routeProvider) {

  $routeProvider.when('/jobs', {
    templateUrl: 'static/app/partials/jobs.html', 
    controller: 'JobsController',
  });

	$routeProvider.when("/jobs/:jobNumber", {
		templateUrl: "static/app/partials/job.html",
		controller: "JobController",
		resolve: {
			thisJob: ["job", "$route", function(job, $route) {
				return job.get({jobNumber: $route.current.params.jobNumber}).$promise
			}]
		}
	})

	$routeProvider.otherwise({redirectTo: '/jobs'});
}])

.run([function() {
	$(document).foundation();
}]);
