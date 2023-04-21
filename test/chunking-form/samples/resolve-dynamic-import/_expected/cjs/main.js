'use strict';

require('./direct-relative-external');
require('to-indirect-relative-external');
require('direct-absolute-external');
require('to-indirect-absolute-external');

// nested
Promise.resolve().then(function () { return existing; });
import('./direct-relative-external');
import('to-indirect-relative-external');
import('direct-absolute-external');
import('to-indirect-absolute-external');

console.log('existing');

var existing = /*#__PURE__*/Object.freeze({
	__proto__: null
});

//main
Promise.resolve().then(function () { return existing; });
import('./direct-relative-external');
import('to-indirect-relative-external');
import('direct-absolute-external');
import('to-indirect-absolute-external');

import('dynamic-direct-external' + unknown);
import('to-dynamic-indirect-external');
Promise.resolve().then(function () { return existing; });
import('my' + 'replacement');
