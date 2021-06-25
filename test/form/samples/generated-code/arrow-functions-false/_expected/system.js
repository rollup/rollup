System.register('bundle', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			let a; exports('a', a);

			(function (v) { return exports('a', a), v; }({a} = someObject));
			console.log(function (v) { return exports('a', a), v; }({a} = someObject));

		}
	};
});
