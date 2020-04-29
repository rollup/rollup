System.register(['external'], function () {
	'use strict';
	var path;
	return {
		setters: [function (module) {
			path = module.default;
		}],
		execute: function () {

			console.log(path.normalize('foo\\bar'));
			console.log(path.normalize('foo\\bar'));

		}
	};
});
