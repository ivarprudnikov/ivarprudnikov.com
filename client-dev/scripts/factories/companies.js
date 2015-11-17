'use strict';

angular.module('tApp')
	.factory('Companies', ['$resource', function ($resource) {

		return $resource('data/companies.json', { t:(new Date()).getTime() }, {
			getAll: { method:'GET', isArray: true, cache : false }
		});

	}]);
