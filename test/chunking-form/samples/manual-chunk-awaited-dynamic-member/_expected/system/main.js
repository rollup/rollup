System.register(['./generated-shared.js'], (function (exports, module) {
	'use strict';
	var shared;
	return {
		setters: [function (module) {
			shared = module.s;
		}],
		execute: (async function () {

			const m = await module.import('./generated-manual.js');

			console.log(m.m, shared);

		})
	};
}));
