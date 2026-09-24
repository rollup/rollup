System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (async function () {

			const result = await module.import('./generated-b.js');

			const b = exports("b", result.b);

		})
	};
}));
