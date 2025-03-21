System.register(['./generated-leaf.js'], (function (exports) {
	'use strict';
	var three;
	return {
		setters: [function (module) {
			three = module.t;
		}],
		execute: (function () {

			const four = exports("four", three + 1);
			var fortyTwo = exports("default", 42);

		})
	};
}));
