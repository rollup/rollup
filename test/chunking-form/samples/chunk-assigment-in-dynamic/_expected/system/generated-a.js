System.register(['./generated-c.js'], (function (exports) {
	'use strict';
	var cExports;
	return {
		setters: [function (module) {
			cExports = module.c;
		}],
		execute: (function () {

			exports("A", A);

			function A() {
				return { icon: cExports.faPrint };
			}

		})
	};
}));
