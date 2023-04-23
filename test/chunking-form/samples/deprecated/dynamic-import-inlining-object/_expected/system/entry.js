System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const bar = exports('bar', 2);
			Promise.resolve().then(function () { return foo; });

			var foo = /*#__PURE__*/Object.freeze({
				__proto__: null
			});

		})
	};
}));
