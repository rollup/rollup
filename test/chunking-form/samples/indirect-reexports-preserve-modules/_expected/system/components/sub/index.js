System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const foo = exports("foo", 'bar');
			var bar = exports("default", () => {});

		})
	};
}));
