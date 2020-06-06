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
			let a = function (v) { return exports({ a: v, a2: v }); }(1), b = exports('b', 2), c = function (v) { return exports({ c: v, c2: v }); }(3);

			// Export default expression
			var a$1 = exports('default', a);

			// Assignment Expression
			a = function (v) { return exports({ a: a, a2: a }), v; }( b = exports('b', c = function (v) { return exports({ c: c, c2: c }), v; }( 0)));

			// Destructing Assignment Expression
			(function (v) { return exports({ a: a, a2: a, b: b, c: c, c2: c }), v; }({ a, b, c } = { c: 4, b: 5, a: 6 }));

			// Destructuring Defaults
			var p = function (v) { return exports({ p: v, pp: v }); }(5);
			var q = function (v) { return exports({ q: v, qq: v }); }(10);
			(function (v) { return exports({ p: p, pp: p }), v; }({ p = q = function (v) { return exports({ q: q, qq: q }), v; }( 20) } = {}));

			// Function Assignment
			function fn () {

			}
			fn = function (v) { return exports({ fn: fn, fn2: fn }), v; }( 5);

			// Update Expression
			a++, exports({ a: a, a2: a }), (exports('b', b + 1), b++), ++c, exports({ c: c, c2: c });

			// Class Declaration
			class A {} exports({ A: A, B: A });

		}
	};
});
