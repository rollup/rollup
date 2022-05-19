'use strict';

var main = require('./main.js');

const sharedDynamic = true;

Promise.resolve().then(function () { return require('./generated-dynamic2.js'); });
console.log(sharedDynamic);

var dynamic1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	shared: main.shared
});

exports.dynamic1 = dynamic1;
exports.sharedDynamic = sharedDynamic;
