System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (async function () {

			const value = exports("value", 0);
			await module.import('./awaited.js').then(function (n) { return n.a; });
			const loadDynamic = exports("loadDynamic", () => module.import('./generated-dynamic.js'));

		})
	};
}));
