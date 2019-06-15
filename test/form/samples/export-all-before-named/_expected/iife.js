var exposedInternals = (function (exports, external) {
	'use strict';

	function internalFn(path) {
		return path[0] === '.';
	}

	Object.keys(external).forEach(function (key) {
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function () {
				return external[key];
			}
		});
	});
	exports.internalFn = internalFn;

	return exports;

}({}, external));
