System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const {a = 1, ...b} = global1, c = exports('c', global2), {d} = global3; exports({a: a, b: b, d: d});
			const [e, ...f] = global4; exports({e: e, f: f});
			const {g, x: h = 2, y: {z: i}, a: [j ,k,, l]} = global5; exports({g: g, h: h, i: i, j: j, k: k, l: l});

			var m = exports('m', 1);
			var {m} = global6; exports('m', m);

		}
	};
});
