System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			exports("p", preload);

			function preload(callback) {
				return callback();
			}

			const load = exports("l", () => module.import('./generated-entry.js'));

		})
	};
}));
