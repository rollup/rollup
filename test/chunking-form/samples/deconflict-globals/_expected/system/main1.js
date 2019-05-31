System.register(['./generated-chunk.js'], function (exports, module) {
	'use strict';
	var x;
	return {
		setters: [function (module) {
			x = module.x;
		}],
		execute: function () {

			console.log(x);

		}
	};
});
