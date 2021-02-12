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
			exports({ namespace: namespace, namespace2: namespace });

			// Namespace variable

			// Variable Declaration
			let a = function (v) { return exports({ a: v, a2: v }), v; }(1), b = exports('b', 2), c = function (v) { return exports({ c: v, c2: v }), v; }(3);

			// Export default expression
			var a$1 = exports('default', a);

			// Assignment Expression
			a = function (v) { return exports({ a: v, a2: v }), v; }(b = exports('b', c = function (v) { return exports({ c: v, c2: v }), v; }(0)));

			// Destructing Assignment Expression
			((function (v) { return exports({ a: a, a2: a, b: b, c: c, c2: c }), v; }({ a, b, c } = { c: 4, b: 5, a: 6 })));

			// Destructuring Defaults
			var p = function (v) { return exports({ p: v, pp: v }), v; }(5);
			var q = function (v) { return exports({ q: v, qq: v }), v; }(10);
			((function (v) { return exports({ p: p, pp: p }), v; }({ p = q = function (v) { return exports({ q: v, qq: v }), v; }(20) } = {})));

			// Function Assignment
			function fn () {

			}
			fn = function (v) { return exports({ fn: v, fn2: v }), v; }(5);

			// Update Expression
			(function (v) { return exports({ a: v, a2: v }), v; }(++a)), (exports('b', b + 1), b++), (++c, exports({ c: c, c2: c }), c);
			(function (v) { return exports({ a: v, a2: v }), v; }(++a));

			// Class Declaration
			class A {} exports({ A: A, B: A });

		}
	};
});
