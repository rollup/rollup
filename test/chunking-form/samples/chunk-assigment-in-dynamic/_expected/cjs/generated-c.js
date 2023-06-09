'use strict';

var c = {};

(function (exports) {
	exports.preFaPrint = {
		foo: 1
	};

	exports.faPrint = exports.preFaPrint; 
} (c));

exports.c = c;
