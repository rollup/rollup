System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const foo = exports("f", 'dep2');
			Promise.resolve().then(function () { return dep1; }).then(console.log);

			const bar = exports("b", 'dep1' + foo);

			var dep1 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				bar: bar
			});
			exports("d", dep1);

		})
	};
}));
