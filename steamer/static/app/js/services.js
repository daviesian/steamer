'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
	.value('version', '0.1')

	.service('jobs', ["$resource", function($resource) {
		return $resource("/api/jobs/:jobNumber");
	}])

	.service('job', ["$resource", function($resource) {
		return $resource("/api/jobs/:jobNumber", {
			jobNumber: "@jobNumber",

		})
	}])

	.service('process', function() {
		return {
			steps: [{
				id: "jobCreated",
				title: "Job request received"
			}, {
				id: "inspectorAllocated",
				title: "Inspector Allocated"
			}, {
				id: "formsSent",
				title: "Job sheet and inspection form sent to inspector"
			}, {
				id: "formsReceived",
				title: "Job sheet and inspection form received from inspector"
			}, {
				id: "inspectorPaid",
				title: "Inspector paid"
			}, {
				id: "chargesUpdated",
				title: "Charges Updated"
			}, {
				id: "archiveUpdated",
				title: "Archive Updated"
			}, {
				id: "inspectionReportSigned",
				title: "Inspection report signed"
			}, {
				id: "invoiceRaised",
				title: "Invoice raised"
			}, {
				id: "invoiceSent",
				title: "Invoice and report sent to customer"
			}, {
				id: "paymentReceived",
				title: "Payment received"
			}]
		}
	})

	.service('actions', [function() {

		return {

			addNote: {

				predicate: function(job) {
					return true;
				},

				caption: "Add note",

				templateUrl: "partials/actions/addNote.html",

			},

			enterCustomer: {
				
				predicate: function(job) {
					return !job.customer;
				},

				caption: "Add Customer Name",

				templateUrl: "partials/actions/enterCustomer.html",

			},

			enterBoat: {
				
				predicate: function(job) {
					return !job.boat;
				},

				caption: "Add Boat Name",

				templateUrl: "partials/actions/enterBoat.html",

			},

			enterInspector: {
				
				predicate: function(job) {
					return !job.inspector;
				},

				caption: "Add Inspector Name",

				templateUrl: "partials/actions/enterInspector.html",

			},

			closeJob: {

				predicate: function(job) {
					return !job.closed;
				},

				caption: "Close Job",

				onActivate: function($scope) {
					$scope.job.closed = true;
					$scope.job.$save();
				}
			},

			reopenJob: {

				predicate: function(job) {
					return job.closed;
				},

				caption: "Re-open Job",

				onActivate: function($scope) {
					$scope.job.closed = false;
					$scope.job.$save();
				}
			}


		};
	}])
