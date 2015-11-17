'use strict';

angular.module('tApp')
	.factory('Companies', ['$resource', function ($resource) {

		return $resource('/data/companies.json', {}, {
			getAll: { method:'GET', isArray: true, cache : true }
		});

	}]);
