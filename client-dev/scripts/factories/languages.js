'use strict';

angular.module('tApp')
	.factory('Languages', ['$resource', function ($resource) {

		return $resource('data/languages.json', { t:(new Date()).getTime() }, {
			getAll: { method:'GET', isArray: true, cache : false  }
		});

	}]);
