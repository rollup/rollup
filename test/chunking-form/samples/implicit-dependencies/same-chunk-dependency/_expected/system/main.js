System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			module.import('./generated-lib.js').then(function (n) { return n.l; });

		}
	};
});
