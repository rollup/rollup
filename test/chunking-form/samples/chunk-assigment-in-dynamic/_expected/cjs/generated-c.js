'use strict';

var c = {};

var hasRequiredC;

function requireC () {
	if (hasRequiredC) return c;
	hasRequiredC = 1;
	(function (exports$1) {
		exports$1.preFaPrint = {
			foo: 1
		};

		exports$1.faPrint = exports$1.preFaPrint; 
	} (c));
	return c;
}

var cExports = /*@__PURE__*/ requireC();

exports.cExports = cExports;
