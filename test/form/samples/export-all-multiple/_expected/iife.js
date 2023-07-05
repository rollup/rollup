var myBundle = (function (exports, foo, bar, baz) {
	'use strict';



	Object.keys(foo).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () { return foo[k]; }
		});
	});
	Object.keys(bar).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () { return bar[k]; }
		});
	});
	Object.keys(baz).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () { return baz[k]; }
		});
	});

	return exports;

})({}, foo, bar, baz);
