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
				id: "jobCreatedInCharges",
				title: "Job created in charges"
			}, {
				id: "jobCreatedInArchive",
				title: "Job created in archive"
			}, {
				id: "jobSheetCreated",
				title: "Job sheet created"
			}, {
				id: "inspectionFormCreated",
				title: "Inspection form created"
			}, {
				id: "formsSent",
				title: "Job sheet and inspection form sent to inspector",
				relax: true
			}, {
				id: "formsReceived",
				title: "Job sheet and inspection form received from inspector"
			}, {
				id: "chargesUpdated",
				title: "Charges updated"
			}, {
				id: "inspectionReportSigned",
				title: "Inspection report signed"
			}, {
				id: "inspectionReportScanned",
				title: "Inspection report scanned"
			}, {
				id: "jobSheetScanned",
				title: "Job sheet scanned"
			}, {
				id: "inspectorPaid",
				title: "Inspector paid"
			}, {
				id: "archiveUpdated",
				title: "Archive updated"
			}, {
				id: "invoiceRaised",
				title: "Invoice raised"
			}, {
				id: "invoiceSent",
				title: "Invoice and report sent to customer",
				relax: true
			}, {
				id: "paymentReceived",
				title: "Payment received"
			}, {
				id: "paymentRecordedInCharges",
				title: "Payment recorded in charges",
			}]
		}
	})

	.service('actions', [function() {

		return {


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
