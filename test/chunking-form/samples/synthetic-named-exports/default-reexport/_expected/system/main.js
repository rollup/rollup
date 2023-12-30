System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var lib = exports("lib", {});

			console.log('side-effect', lib);

			const component = exports("component", module.import('./generated-component.js').then(function (n) { return n.c; }));

		})
	};
}));
