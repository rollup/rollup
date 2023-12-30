System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var main = exports("default", Promise.all([module.import('./entry.js'), module.import('./generated-other.js')]));

		})
	};
}));
