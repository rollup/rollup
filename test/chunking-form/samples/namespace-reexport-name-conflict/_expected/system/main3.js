System.register(['./generated-dep.js'], function () {
	'use strict';
	var reexported;
	return {
		setters: [function (module) {
			reexported = module.r;
		}],
		execute: function () {

			console.log(reexported);

		}
	};
});
