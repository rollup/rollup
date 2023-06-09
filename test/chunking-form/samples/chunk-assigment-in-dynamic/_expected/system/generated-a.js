System.register(['./generated-c.js'], (function (exports) {
	'use strict';
	var c;
	return {
		setters: [function (module) {
			c = module.c;
		}],
		execute: (function () {

			exports('A', A);

			function A() {
				return { icon: c.faPrint };
			}

		})
	};
}));
