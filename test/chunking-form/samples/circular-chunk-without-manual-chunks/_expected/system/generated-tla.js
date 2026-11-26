System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (async function () {

			const b = await module.import('./generated-b.js');

			console.log('tla', typeof b);

		})
	};
}));
