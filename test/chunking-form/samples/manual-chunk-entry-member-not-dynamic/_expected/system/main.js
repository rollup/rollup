System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const X = 'x';

			module.import('./generated-manual.js').then(function (n) { return n.m; }).then(m => console.log(m.MB, m.OTHER, X));

		})
	};
}));
