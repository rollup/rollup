'use strict';

const shared = 'shared';

console.log(shared);
new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); });
const unused = 42;

exports.shared = shared;
exports.unused = unused;
