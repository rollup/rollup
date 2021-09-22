System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			module.import('./generated-dep1.js').then(n => n.d).then(console.log);

		})
	};
}));
