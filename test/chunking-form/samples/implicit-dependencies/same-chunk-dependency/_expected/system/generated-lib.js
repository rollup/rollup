System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const dep = exports("d", 'dep');

			console.log('lib', dep);

			var lib = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({}, null));
			exports("l", lib);

		})
	};
}));
