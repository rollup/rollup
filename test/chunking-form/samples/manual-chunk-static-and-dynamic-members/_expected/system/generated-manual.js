System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const a = exports("a", 'a');

			const b = 'b';

			var mB = /*#__PURE__*/Object.freeze({
				__proto__: null,
				b: b
			});
			exports("m", mB);

		})
	};
}));
