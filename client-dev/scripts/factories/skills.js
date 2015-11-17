'use strict';

angular.module('tApp')
	.factory('Skills', ['$resource', function ($resource) {

		return $resource('data/skills.json', { t:(new Date()).getTime() }, {
			getAll: { method:'GET', isArray: true, cache : false  }
		});

	}]);
