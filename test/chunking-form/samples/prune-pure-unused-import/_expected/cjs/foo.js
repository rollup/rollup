'use strict';

var external = require('external');

if (external.bar) {
	console.log(true);
}

var foo = 1;

module.exports = foo;
