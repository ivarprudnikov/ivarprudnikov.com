(function (exports) {

	"use strict";

	var fs = require('fs');

	exports.init = function (app) {

		console.log('Loading routes from: ' + __dirname);
		fs.readdirSync(__dirname).forEach(function(file) {
			if ( file === "init.js" || file.substr(file.lastIndexOf('.') + 1) !== 'js' ) return;
			var name = file.substr(0, file.indexOf('.'));
			var route = require('./' + name);
			route.init(app);
		});

	};

}(exports));
