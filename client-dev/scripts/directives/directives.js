'use strict';

angular.module('tApp')

/**
 * Dropdown directive that gets opened and closed only through
 * clicking an opener
 * Returns <li></li> element
 */
	.directive('filterdropdown', function () {
		return {
			restrict: 'EA',
			template: '' +
				'<li class="filterdropdown_root" ng-class="{filterdropdown_open:active}">'+
					'<a class="filterdropdown_link" ng-click="toggle()" ui-keypress="{13:\'toggle()\'}" tabindex="0">{{title}} <span class="caret"></span></a>'+
					'<span class="filterdropdown_dropdown">' +
						'<span class="filterdropdown_dropdown_arrow"></span>' +
						'<span class="filterdropdown_dropdown_content" ng-transclude></span>' +
					'</span>'+
				'</li>',
			scope: { title: '@', active:'&' },
			controller: ['$scope', '$element', '$document', function($scope,$element,$document){

				$scope.active = false;

				$scope.toggle = function(){
					return $scope.active ? $scope.hide() : $scope.show();
				};

				$scope.show = function(){
					$scope.$parent.$broadcast('filterdropdown_opening');
					$scope.active = true;
				};

				$scope.hide = function(){
					$scope.active = false;
				};

				$scope.$on('filterdropdown_opening',$scope.hide);

				$element.on('mouseleave',$scope.hide);

			}],
			replace: true,
			transclude: true
		};

	});
