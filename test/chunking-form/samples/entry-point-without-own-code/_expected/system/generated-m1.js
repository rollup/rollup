System.register(['./m2.js'], (function (exports) {
	'use strict';
	var m2;
	return {
		setters: [function (module) {
			m2 = module.default;
		}],
		execute: (function () {

			var ms = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
				m2: m2
			}, null));
			exports("m", ms);

		})
	};
}));
