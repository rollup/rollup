System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const a = 'a';

			var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
				a: a,
				b: a,
				default: a
			}, null));

			console.log(ns);

			const foo = 1; exports({ bar: foo, default: foo, foo: foo });

		})
	};
}));
