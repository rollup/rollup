System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			globalThis.otherSideEffect = true;

			const OTHER = exports("O", 'other');

			const MB = 'mB';

			var mB = /*#__PURE__*/Object.freeze({
				__proto__: null,
				MB: MB
			});
			exports("m", mB);

		})
	};
}));
