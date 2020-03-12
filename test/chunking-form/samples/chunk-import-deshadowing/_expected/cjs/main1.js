'use strict';

var lib = require('./generated-lib.js');

function fn() {
	var emptyFunction = lib.emptyFunction;
	console.log(emptyFunction);
}

console.log('dep1');

fn();
