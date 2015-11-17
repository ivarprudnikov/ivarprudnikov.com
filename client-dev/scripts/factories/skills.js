'use strict';

angular.module('tApp')
	.factory('Skills', ['$resource', function ($resource) {

		return $resource('data/skills.json', {}, {
			getAll: { method:'GET', isArray: true, cache : true  }
		});

	}]);
