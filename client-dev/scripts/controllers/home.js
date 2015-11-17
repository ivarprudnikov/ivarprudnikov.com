'use strict';

angular.module('tApp')
	.controller('HomeController', ['$scope','$rootScope','$timeout', function ($scope,$rootScope,$timeout) {

		$scope.changeBackground = function(link,isActive){
			var bodyClass = "body-hover-link-" + link;
			var b$ = $('body');
			return isActive ? b$.addClass(bodyClass) : b$.removeClass(bodyClass);
		};

		$scope.codeText = '01010010011010010100101011100100';

		var timer = null;

		$scope.execTimer = function(){
			timer = $timeout(function() {
				var t = $scope.codeText;
				var a = t.slice(0,t.length - 3);
				var b = t.slice(t.length - 3);
				$scope.codeText = b + a;

				$scope.execTimer();

			}, 200);
		};

		$scope.execTimer();

		$scope.$on("$destroy", function() {
			if (timer) {
				$timeout.cancel(timer);
			}
		});

	}]);
