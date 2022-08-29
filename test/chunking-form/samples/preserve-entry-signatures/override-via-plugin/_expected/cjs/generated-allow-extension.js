'use strict';

const shared = 'shared';

console.log(shared);
Promise.resolve().then(function () { return require('./generated-dynamic2.js'); });
const unused = 42;

exports.shared = shared;
exports.unused = unused;
