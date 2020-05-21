System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

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
			let a = exports('default', exports('a2', exports('a', 1))), b = exports('b', 2), c = exports('c2', exports('c' = 3));

			// Export default expression

			// Assignment Expression
			a = exports('default', exports('a2', exports('a', b = exports('b', c = exports('c2', exports('c', 0))))));

			// Destructing Assignment Expression
			(function (v) {exports({a: a, a2: a, default: a, b: b, c: c, c2: c}); return v;} ({a, b, c} = { c: 4, b: 5, a: 6 }));
			
			// Update Expression
			a = exports('default', exports('a2', exports('a', a + 1))), b = exports('b', b + 1), c = exports('c2', exports('c', c + 1));

			// Class Declaration
			export class A {} exports({ A: A, B: A });

		}
	};
});
