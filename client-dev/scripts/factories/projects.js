'use strict';

angular.module('tApp')
	.factory('Projects', ['$resource', function ($resource) {

		return $resource('data/projects.json', { t:(new Date()).getTime() }, {
			getAll: { method:'GET', isArray: true, cache : false  }
		});

	}]);
