'use strict';

var c = require('./generated-c.js');

function A() {
	return { icon: c.cExports.faPrint };
}

exports.A = A;
