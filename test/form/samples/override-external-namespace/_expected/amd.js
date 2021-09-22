define(['exports', 'external'], (function (exports, external) { 'use strict';

	const a = 'defined';
	exports.b = void 0;
	var c;
	const reassign = () => (exports.b = 'defined');

	exports.a = a;
	exports.c = c;
	exports.reassign = reassign;
	Object.keys(external).forEach(function (k) {
		if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () { return external[k]; }
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

}));
