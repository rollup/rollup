System.register(['./generated-dep.js', 'external', './generated-index.js'], function () {
	'use strict';
	var reexported;
	return {
		setters: [function (module) {
			reexported = module.r;
		}, function () {}, function () {}],
		execute: function () {

			console.log(reexported);

		}
	};
});
