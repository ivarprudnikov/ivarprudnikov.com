'use strict';

angular.module('tApp')
	.controller('ContactsController', ['$scope','$rootScope','$timeout','$http','$window', function ($scope,$rootScope,$timeout,$http,$window) {

    $scope.animateHeader = false;

    $timeout(function() {
      $scope.animateHeader = true;
    }, 100);

		function sendEmailAnalyticsEvent(label){
			ga('send', {
				'hitType': 'event',          // Required.
				'eventCategory': 'email',   // Required.
				'eventAction': 'submit',      // Required.
				'eventLabel': label || 'link'
			});
		}

	}]);
