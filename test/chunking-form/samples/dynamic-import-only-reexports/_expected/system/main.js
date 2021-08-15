System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			module.import('./generated-dynamic.js').then(({ value }) => console.log(value));

		})
	};
}));
