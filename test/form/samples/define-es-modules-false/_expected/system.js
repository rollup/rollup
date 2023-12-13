System.register('foo', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const make1 = exports("make1", () => {});

			const make2 = exports("make2", () => {});

		})
	};
}));
