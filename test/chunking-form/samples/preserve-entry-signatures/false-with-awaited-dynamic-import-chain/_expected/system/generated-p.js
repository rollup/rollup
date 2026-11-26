System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const loadX = () => module.import('./generated-x.js'); exports("loadX", loadX);

		})
	};
}));
