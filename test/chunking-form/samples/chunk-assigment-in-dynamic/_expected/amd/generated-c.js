define(['exports'], (function (exports) { 'use strict';

	var c = {};

	var hasRequiredC;

	function requireC () {
		if (hasRequiredC) return c;
		hasRequiredC = 1;
		(function (exports) {
			exports.preFaPrint = {
				foo: 1
			};

			exports.faPrint = exports.preFaPrint; 
		} (c));
		return c;
	}

	var cExports = /*@__PURE__*/ requireC();

	exports.cExports = cExports;

}));
