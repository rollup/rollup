'use strict';

const shared = 'shared';

console.log(shared);
Promise.resolve().then(function () { return require('./generated-dynamic2.js'); });

exports.shared = shared;
