System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			const bar = exports('bar', 2);
			Promise.resolve().then(function () { return foo$1; });

			const foo = 1;

			var foo$1 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				foo: foo
			});

		}
	};
});
