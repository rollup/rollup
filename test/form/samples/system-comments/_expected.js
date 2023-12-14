System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const pureFunc = () => console.log('not really pure') || 0;

			var singleLine = exports("singleLine", /*#__PURE__*/pureFunc());

			exports("singleLine", singleLine = /*#__PURE__*/pureFunc());

			var multiLine =
				exports("multiLine", /*#__PURE__*/
				pureFunc());

			exports("multiLine", multiLine =
				/*#__PURE__*/
				pureFunc());

		})
	};
}));
