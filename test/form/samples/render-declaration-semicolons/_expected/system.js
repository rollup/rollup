System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var a, b;
			console.log(a, b);

			var c, d;
			console.log(c, d);

			const e = 1, f = 2;
			console.log(e, f);

			const g = 3, h = 4;
			console.log(g, h);

			var i, j; exports({ __proto__: null, i: i, j: j });

			var k, l; exports({ __proto__: null, k: k, l: l });

			const m = 1, n = 2; exports({ __proto__: null, m: m, n: n });

			const o = 3, p = 4; exports({ __proto__: null, o: o, p: p });

		})
	};
}));
