'use strict';

const shared = 'shared';

const unused = 'unused';
const dynamic = new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); });

globalThis.sharedStatic = shared;

exports.dynamic = dynamic;
exports.shared = shared;
exports.unused = unused;
