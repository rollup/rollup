'use strict';

const shared = 'shared';

new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); });
globalThis.sharedStatic = shared;

exports.shared = shared;
