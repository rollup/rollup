System.register(['./generated-c.js'], (function (exports) {
	'use strict';
	var c;
	return {
		setters: [function (module) {
			c = module.c;
		}],
		execute: (function () {

			exports("B", B);

			function B() {
				return { icon: c.faPrint };
			}

		})
	};
}));
