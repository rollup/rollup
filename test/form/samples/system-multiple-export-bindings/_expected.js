System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			exports({
				fn: fn,
				fn2: fn
			});

			const x = exports('x', 123);
			const y = exports('y', 456);

			var namespace = /*#__PURE__*/Object.freeze({
				__proto__: null,
				x: x,
				y: y
			});
			exports({namespace: namespace, namespace2: namespace});

			// Namespace variable

			// Variable Declaration
			let a = function (v) {exports({a: a, a2: a}); return v;} ( 1), b = exports('b', 2), c = function (v) {exports({c: c, c2: c}); return v;} ( 3);

			// Export default expression
			var a$1 = exports('default', a);

			// Assignment Expression
			a = function (v) {exports({a: a, a2: a}); return v;} ( b = exports('b', c = function (v) {exports({c: c, c2: c}); return v;} ( 0)));

			// Destructing Assignment Expression
			(function (v) {exports({a: a, a2: a, b: b, c: c, c2: c}); return v;} ({ a, b, c } = { c: 4, b: 5, a: 6 }));

			// Destructuring Defaults
			var p = function (v) {exports({p: p, pp: p}); return v;} ( 5);
			var q = function (v) {exports({q: q, qq: q}); return v;} ( 10);
			(function (v) {exports({p: p, pp: p}); return v;} ({ p = q = function (v) {exports({q: q, qq: q}); return v;} ( 20) } = {}));

			// Function Assignment
			function fn () {

			}
			fn = function (v) {exports({fn: fn, fn2: fn}); return v;} ( 5);

			// Update Expression
			a++, exports({a: a, a2: a}), (exports('b', b + 1), b++), ++c, exports({c: c, c2: c});

			// Class Declaration
			class A {} exports({A: A, B: A});

		}
	};
});
