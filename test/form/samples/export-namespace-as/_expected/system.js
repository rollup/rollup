System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const foo = 'foo1';
			const bar = 'bar1';

			var dep = /*#__PURE__*/Object.freeze({
				__proto__: null,
				bar: bar,
				foo: foo
			});
			exports("dep", dep);

		})
	};
}));
