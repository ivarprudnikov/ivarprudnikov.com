angular.module('tApp')
	.factory('Languages', ['$resource', function ($resource) {

		return $resource('/data/languages.json', {}, {
			getAll: { method:'GET', isArray: true, cache : true  }
		});

	}]);
