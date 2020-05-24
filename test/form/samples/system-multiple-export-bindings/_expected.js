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
			let a = exports('a2', exports('a', 1)), b = exports('b', 2), c = exports('c2', exports('c', 3));

			// Export default expression
			var a$1 = exports('default', a);

			// Assignment Expression
			a = exports('a', exports('a2', b = exports('b', c = exports('c', exports('c2', 0)))));

			// Destructing Assignment Expression
			(function (v) {exports({a: a, a2: a, b: b, c: c, c2: c}); return v;} ({ a, b, c } = { c: 4, b: 5, a: 6 }));

			// Destructuring Defaults
			var p = exports('pp', exports('p', 5));
			var q = exports('qq', exports('q', 10));
			(function (v) {exports({p: p, pp: p}); return v;} ({ p = q = exports('q', exports('qq', 20)) } = {}));

			// Function Assignment
			function fn () {

			}
			fn = exports('fn', exports('fn2', 5));

			// Update Expression
			a++, exports({a: a, a2: a}), (exports('b', b + 1), b++), ++c, exports({c: c, c2: c});

			// Class Declaration
			class A {} exports({A: A, B: A});

		}
	};
});
