'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const shared = 'shared';

const dynamic = Promise.resolve().then(function () { return require('./generated-dynamic.js'); });

globalThis.sharedStatic = shared;

exports.shared = shared;
