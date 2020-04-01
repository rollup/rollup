'use strict';

var externalNs1 = require('external-ns-1');
var externalNs2 = require('external-ns-2');

const val = 5;

var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(externalNs1, externalNs2, {
	__proto__: null,
	val: val
}));

module.exports = ns;
