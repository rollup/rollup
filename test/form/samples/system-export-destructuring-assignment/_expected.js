System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			exports({
				a: void 0,
				b: void 0,
				c: void 0
			});

			let a, b, c;

			console.log(function (v) {exports('a', a); return v;} ({a} = someObject));
			(function (v) {exports({b: b, c: c}); return v;} ({b, c} = someObject));

		}
	};
});
