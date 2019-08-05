'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var shared = require('./chunks/chunk.js');

assert.equal(shared.sharedValue, 'shared');

const promise = new Promise(function (resolve) { resolve(require('./chunks/other.js')); }).then(result =>
	assert.deepEqual(result, { value: 'shared' })
);

exports.promise = promise;
