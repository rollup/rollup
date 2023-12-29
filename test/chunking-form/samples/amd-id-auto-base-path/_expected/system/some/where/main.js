System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			exports("getA", getA);

			function getA() {
				return module.import('./chunks/generated-a.js');
			}

		})
	};
}));
