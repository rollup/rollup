'use strict';

const shared = 'shared';

console.log(shared);
Promise.resolve().then(function () { return require('./generated-dynamic3.js'); });

exports.shared = shared;
