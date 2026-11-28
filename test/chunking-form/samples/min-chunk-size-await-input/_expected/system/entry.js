System.register(['./generated-app.js'], (function (exports, module) {
	'use strict';
	var preload;
	return {
		setters: [function (module) {
			preload = module.p;
		}],
		execute: (function () {

			preload(() => module.import('./generated-app.js').then(function (n) { return n.a; })).then(({ default: App }) => console.log(App()));

		})
	};
}));
