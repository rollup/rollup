System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			// middle binding
			const a1 = 1, a2 = exports("a2", 2), a3 = 3;
			console.log(a1, a2, a3);

			// first binding
			const b1 = exports("b1", 1), b2 = 2;
			console.log(b1, b2);

			// last binding
			const c1 = 1, c2 = exports("c2", 2);
			console.log(c1, c2);

			// middle binding with other bindings removed
			const d2 = exports("d2", 2);

			// uninitialized binding
			let e1 = 1, e2, e3 = 3; exports("e2", e2);
			console.log(e1, e2, e3);

			// destructuring declaration
			let {f1, f2} = globalThis.obj; exports("f2", f2);

		})
	};
}));
