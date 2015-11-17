'use strict';

angular.module('tApp')
	.controller('WorkGalleryItemController', ['Projects','Companies','Skills','Languages','$scope','$stateParams',
		function (Projects, Companies, Skills, Languages, $scope, $stateParams) {

		var id = $stateParams.itemId;

		Projects.getAll(function(projects){
			$scope.item = _.find(projects, function(item){ return item.id === id; });

			Companies.getAll(function(companies){
				$scope.company = _.find(companies, function(item){ return item.id === $scope.item.company_id; });
			});

			Languages.getAll(function(languages){
				$scope.languages = _.filter(languages, function(l){ return _.indexOf($scope.item.languages, l.id) > -1; });
			});

			Skills.getAll(function(skills){
				$scope.skills = _.filter(skills, function(s){ return _.indexOf($scope.item.skills, s.id) > -1; });
			});

		});

	}]);
