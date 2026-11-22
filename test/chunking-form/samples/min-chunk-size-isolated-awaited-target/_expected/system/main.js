System.register(['./generated-preload.js'], (function (exports, module) {
	'use strict';
	var preload;
	return {
		setters: [function (module) {
			preload = module.p;
		}],
		execute: (async function () {

			await preload(() => module.import('./generated-entry.js'));

		})
	};
}));
