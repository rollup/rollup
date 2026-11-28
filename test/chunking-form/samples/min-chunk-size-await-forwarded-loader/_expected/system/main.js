System.register(['./generated-preload.js'], (function (exports, module) {
	'use strict';
	var preload;
	return {
		setters: [function (module) {
			preload = module.p;
		}],
		execute: (async function () {

			const load = () => module.import('./generated-entry.js');

			await preload(load);

		})
	};
}));
