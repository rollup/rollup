System.register(['./generated-app.js'], (function (exports, module) {
	'use strict';
	var preload;
	return {
		setters: [function (module) {
			preload = module.p;
		}],
		execute: (async function () {

			await preload(() => module.import('./entry.js'));

		})
	};
}));
