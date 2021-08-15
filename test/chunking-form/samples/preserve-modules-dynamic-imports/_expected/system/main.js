System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			module.import('./dynamic-included.js').then(result => console.log(result));

		})
	};
}));
