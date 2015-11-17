'use strict';

angular.module('tApp')
	.controller('WorkTimelineItemController', ['Companies','Projects','Skills','Languages','$scope','$stateParams',
		function (Companies, Projects, Skills, Languages, $scope, $stateParams) {

		var id, yearHeight, yearLabelHeight, monthHeight, monthArray;

		yearHeight = 164;
		yearLabelHeight = 20;
		monthHeight = (yearHeight - yearLabelHeight) / 12;

		monthArray = [ "January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December" ];

		id = $stateParams.itemId;

		$scope.months = _.range(1, 13).reverse();

		$scope.monthName = function(monthNo){
			return monthArray[monthNo-1];
		};

		Companies.getAll(function(items){

			var fromDate, toDate, fromYear, toYear;

			$scope.item = _.find(items, function(item){ return item.id === id; });

			fromDate = new Date();
			fromDate.setTime( $scope.item.from );
			fromYear = fromDate.getFullYear();

			toDate = new Date();
			if($scope.item.to) {
        toDate.setTime( $scope.item.to );
      }
			toYear = toDate.getFullYear();

			$scope.jobYears = _.range(fromYear, toYear + 1).reverse();

			Projects.getAll(function(projects){

				// company projects
				$scope.projects = _.filter(projects, function(item){ return item.company_id === id; });

				// company skills
				Skills.getAll(function(skills){
					var skillIds = _.flatten( _.pluck($scope.projects,'skills') );
					$scope.skills = _.filter(skills, function(s){ return _.indexOf(skillIds, s.id) > -1; });
				});

				// company technologies used
				Languages.getAll(function(languages){
					var languageIds = _.flatten( _.pluck($scope.projects,'languages') );
					$scope.languages = _.filter(languages, function(l){ return _.indexOf(languageIds, l.id) > -1; });
				});

			});



		});

		$scope.timelineBlockHeight = function(){

			if(!$scope.jobYears) {
        return 0;
      }

			return $scope.jobYears.length * yearHeight + yearLabelHeight;

		};

		/**
		 * Almost the same as in workTimeline.js
		 * but distances are calculated from
		 * current job end year, not from current year
		 * @param job
		 * @returns {number}
		 */
		$scope.jobLineHeight = function(job){
			return ($scope.jobDistanceFromNow(job) - $scope.jobDistanceToEnd(job));
		};

		$scope.jobDistanceToEnd = function(job){

			if(!job) {
        return 0;
      }

			var toDate = new Date();
			if(job.to){
        toDate.setTime( job.to );
      }
			var year = toDate.getFullYear();
			var month = toDate.getMonth() + 1;
			var yearsFromNow = $scope.jobYears[0] - year;

			return ( (yearsFromNow + 1) * yearHeight - (month * monthHeight) );
		};

		$scope.jobDistanceFromNow = function(job){

			if(!job) {
        return 0;
      }

			var fromDate = new Date();
			fromDate.setTime( job.from );
			var year = fromDate.getFullYear();
			var month = fromDate.getMonth() + 1;
			var yearsFromNow = $scope.jobYears[0] - year;

			return ( (yearsFromNow + 1) * yearHeight - (month * monthHeight) );
		};

	}]);
