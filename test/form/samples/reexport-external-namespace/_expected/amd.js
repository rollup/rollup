define(['exports', 'external'], (function (exports, external) { 'use strict';



	Object.keys(external).forEach(function (k) {
		if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () { return external[k]; }
		});
	});

}));
