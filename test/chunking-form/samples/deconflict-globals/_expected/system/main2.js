System.register(['./generated-dep.js'], function () {
	'use strict';
	var x$1;
	return {
		setters: [function (module) {
			x$1 = module.x;
		}],
		execute: function () {

			console.log(x, x$1);

		}
	};
});
