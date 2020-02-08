'use strict';

require('./generated-dep2-effect.js');
require('./generated-dep4-effect.js');

var value = 42;

function onlyUsedByOne(value) {
	console.log('Hello', value);
}

onlyUsedByOne(value);
