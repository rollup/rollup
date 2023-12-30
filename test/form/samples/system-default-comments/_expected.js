System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const pureFunc = () => console.log('not really pure') || 0;

			var main = exports("default", /*#__PURE__*/pureFunc());

		})
	};
}));
