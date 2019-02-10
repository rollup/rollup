System.register(['./generated-chunk.js'], function (exports, module) {
	'use strict';
	var x;
	return {
		setters: [function (module) {
			x = module.a;
		}],
		execute: function () {

			console.log(x);

		}
	};
});
