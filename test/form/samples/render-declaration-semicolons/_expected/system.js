System.register('bundle', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			exports({
				i: void 0,
				j: void 0,
				k: void 0,
				l: void 0
			});

			var a, b;
			console.log(a, b);

			var c, d;
			console.log(c, d);

			const e = 1, f = 2;
			console.log(e, f);

			const g = 3, h = 4;
			console.log(g, h);

			var i, j;

			var k, l;

			const m = exports('m', 1), n = exports('n', 2);

			const o = exports('o', 3), p = exports('p', 4);

		}
	};
});
