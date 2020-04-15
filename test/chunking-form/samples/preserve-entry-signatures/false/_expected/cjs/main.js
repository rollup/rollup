'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const shared = 'shared';

const dynamic = new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); });

globalThis.sharedStatic = shared;

exports.shared = shared;
