'use strict';

const shared = 'shared';

const nonEssential = 'non-essential';
const dynamic = new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); });

globalThis.sharedStatic = shared;

exports.dynamic = dynamic;
exports.nonEssential = nonEssential;
exports.shared = shared;
