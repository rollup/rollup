System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const lib = exports("l", { named: { named: 42 } });

			console.log('side-effect', lib.named);

			console.log('side-effect', lib.named.named);

			const component = exports("c", module.import('./generated-component.js').then(function (n) { return n.c; }));

		})
	};
}));
