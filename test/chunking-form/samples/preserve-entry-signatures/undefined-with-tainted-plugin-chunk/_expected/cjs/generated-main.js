'use strict';

const shared = 'shared';

Promise.resolve().then(function () { return require('./generated-dynamic.js'); });
globalThis.sharedStatic = shared;

exports.shared = shared;
