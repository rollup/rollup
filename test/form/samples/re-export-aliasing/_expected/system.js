System.register('reexportsAliasingExternal', ['d'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("b", module.d);
		}],
		execute: (function () {



		})
	};
}));
