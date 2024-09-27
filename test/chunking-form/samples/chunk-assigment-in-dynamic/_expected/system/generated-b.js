System.register(['./generated-c.js'], (function (exports) {
	'use strict';
	var cExports;
	return {
		setters: [function (module) {
			cExports = module.c;
		}],
		execute: (function () {

			exports("B", B);

			function B() {
				return { icon: cExports.faPrint };
			}

		})
	};
}));
