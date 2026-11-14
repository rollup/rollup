System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			module.import('./generated-manual.js').then(n => console.log(n.a));

		})
	};
}));
