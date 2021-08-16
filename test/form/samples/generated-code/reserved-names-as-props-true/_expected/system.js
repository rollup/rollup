System.register('bundle', [], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var other = {
				foo: 'bar'
			};

			var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), other, {
				default: other
			}));

			console.log(ns, other.foo, other.function, other["some-prop"]);
			console.log(module.meta.function, module.meta["some-prop"]);

			let f = exports('function', 1);
			exports('function', f + 1), f++;

		})
	};
}));
