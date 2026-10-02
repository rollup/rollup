System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const x = 'x';

			var x$1 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				x: x
			});
			exports("x", x$1);

			const m = exports("m", 'm' + x);

		})
	};
}));
