'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var __chunk_1 = require('./chunks/chunk.js');

assert.equal(__chunk_1.sharedValue, 'shared');

const promise = new Promise(function (resolve) { resolve(require('./chunks/other.js')); }).then(result =>
	assert.deepEqual(result, { value: 'shared' })
);

exports.promise = promise;
