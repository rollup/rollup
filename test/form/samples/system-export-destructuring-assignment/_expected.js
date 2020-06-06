System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			exports({
				a: void 0,
				b: void 0,
				c: void 0
			});

			let a, b, c;

			console.log(exports('a', {a} = someObject));
			(function (v) { return exports({ b: b, c: c }), v; }({b, c} = someObject));

		}
	};
});
