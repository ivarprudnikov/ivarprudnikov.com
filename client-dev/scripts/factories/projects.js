'use strict';

angular.module('tApp')
	.factory('Projects', ['$resource', function ($resource) {

		return $resource('data/projects.json', {}, {
			getAll: { method:'GET', isArray: true, cache : true  }
		});

	}]);
