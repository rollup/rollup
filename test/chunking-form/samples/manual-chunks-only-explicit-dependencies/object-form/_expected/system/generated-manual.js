System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			console.log('dep');

			console.log('manual1');

			var manual1 = /*#__PURE__*/Object.freeze({
				__proto__: null
			});
			exports("m", manual1);

			console.log('manual2');

			var manual2 = /*#__PURE__*/Object.freeze({
				__proto__: null
			});
			exports("a", manual2);

		})
	};
}));
