System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			exports({
				fn: fn,
				fn2: fn
			});

			const x = exports("x", 123);
			const y = exports("y", 456);

			var namespace = /*#__PURE__*/Object.freeze({
				__proto__: null,
				x: x,
				y: y
			});
			exports({ namespace: namespace, namespace2: namespace });

			// Namespace variable

			// Variable Declaration
			let a = 1, b = 2, c = 3; exports({ a: a, a2: a, b: b, c: c, c2: c });

			// Export default expression
			var a$1 = exports('default', a);

			// Assignment Expression
			a = exports("b", b = (c = 0, exports({ c: c, c2: c }), c)), exports({ a: a, a2: a }), a;

			// Destructing Assignment Expression
			(function (v) { return exports({ a: a, a2: a, b: b, c: c, c2: c }), v; }({ a, b, c } = { c: 4, b: 5, a: 6 }));

			// Destructuring Defaults
			var p = 5; exports({ p: p, pp: p });
			var q = 10; exports({ q: q, qq: q });
			(function (v) { return exports({ p: p, pp: p }), v; }({ p = (q = 20, exports({ q: q, qq: q }), q) } = {}));

			// Function Assignment
			function fn () {

			}
			fn = 5, exports({ fn: fn, fn2: fn }), fn;

			// Update Expression
			(exports({ a: a + 1, a2: a + 1 }), a++), (exports("b", b + 1), b++), (++c, exports({ c: c, c2: c }), c);
			(exports({ a: a + 1, a2: a + 1 }), a++);

			// Class Declaration
			class A {} exports({ A: A, B: A });

		})
	};
}));
