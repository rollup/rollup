System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			module.import('./generated-dynamic.js').then(function (n) { return n.a; }).then(result => console.log(result));
			module.import('./generated-dynamic.js').then(function (n) { return n.d; }).then(result => console.log(result));

		})
	};
}));
