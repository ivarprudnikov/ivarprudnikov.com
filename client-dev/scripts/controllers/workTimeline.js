'use strict';

angular.module('tApp')
	.controller('WorkTimelineController', ['Companies','$scope','$rootScope','$timeout',
		function (Companies,$scope,$rootScope,$timeout) {

		var yearHeight, yearLabelHeight, monthHeight, codeTimer, monthArray;

		yearHeight = 116;
		yearLabelHeight = 20;
		monthHeight = (yearHeight - yearLabelHeight) / 12;

		monthArray = [ "January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December" ];

		/**
		 * Populate array of available years
		 * [ 2003, 2004, .... ]
		 */
		$scope.years = _.range(2003, (new Date()).getFullYear() + 1).reverse();

		/**
		 * Populate array of available months
		 * [ 12, 11, .... ]
		 */
		$scope.months = _.range(1, 13).reverse();

		$scope.monthName = function(monthNo){
			return monthArray[monthNo-1];
		};

		$scope.companies = Companies.query();

		$scope.jobLineHeight = function(job){
			return ($scope.jobDistanceFromNow(job) - $scope.jobDistanceToEnd(job));
		};

		$scope.jobDistanceToEnd = function(job){
			var toDate = new Date();
			if(job.to){
        toDate.setTime( job.to );
      }
			var year = toDate.getFullYear();
			var month = toDate.getMonth() + 1;
			var yearsFromNow = (new Date()).getFullYear() - year;

			return ( (yearsFromNow + 1) * yearHeight - (month * monthHeight) );
		};

		$scope.jobDistanceFromNow = function(job){
			var fromDate = new Date();
			fromDate.setTime( job.from );
			var year = fromDate.getFullYear();
			var month = fromDate.getMonth() + 1;
			var yearsFromNow = (new Date()).getFullYear() - year;

			return ( (yearsFromNow + 1) * yearHeight - (month * monthHeight) );
		};


	}]);
