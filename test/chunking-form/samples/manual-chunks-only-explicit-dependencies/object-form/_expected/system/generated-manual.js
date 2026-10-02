System.register(['./generated-dep.js'], (function (exports) {
	'use strict';
	return {
		setters: [null],
		execute: (function () {

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
