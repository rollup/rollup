System.register(['./main.js'], (function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports("value", module.value);
		}],
		execute: (function () {

			const loadTarget = exports("loadTarget", () => module.import('./awaited.js').then(function (n) { return n.t; }));

		})
	};
}));
