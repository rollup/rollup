'use strict';

require('external-side-effect');

function onlyUsedByOne() {
	console.log('Hello');
}

onlyUsedByOne();
