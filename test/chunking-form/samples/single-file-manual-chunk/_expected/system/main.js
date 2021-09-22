System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			module.import('./generated-first.js');
			module.import('./generated-second.js').then(function (n) { return n.b; });
			module.import('./generated-second.js').then(function (n) { return n.c; });

		})
	};
}));
