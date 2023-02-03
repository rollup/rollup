'use strict';

const big =
	'1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';

const small1 = Promise.resolve().then(function () { return require('./generated-small2.js'); }).then(function (n) { return n.small1; });
const small2 = Promise.resolve().then(function () { return require('./generated-small2.js'); }).then(function (n) { return n.small2; });

exports.big = big;
exports.small1 = small1;
exports.small2 = small2;
