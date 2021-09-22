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

			var i, j; exports({ i: i, j: j });

			var k, l; exports({ k: k, l: l });

			const m = 1, n = 2; exports({ m: m, n: n });

			const o = 3, p = 4; exports({ o: o, p: p });

		})
	};
}));
