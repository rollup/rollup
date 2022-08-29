var exposedInternals = (function (exports, external) {
	'use strict';

	function internalFn(path) {
		return path[0] === '.';
	}

	exports.internalFn = internalFn;
	Object.keys(external).forEach(function (k) {
		if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () { return external[k]; }
		});
	});

	return exports;

})({}, external);
