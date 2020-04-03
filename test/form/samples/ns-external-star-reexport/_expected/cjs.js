'use strict';

var externalNs1 = require('external-ns-1');
var externalNs2 = require('external-ns-2');

const val = 5;

var ns = /*#__PURE__*/Object.freeze(Object.assign(Object.create(null), externalNs1, externalNs2, {
	val: val
}));

module.exports = ns;
