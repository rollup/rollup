'use strict';

const sharedValue = 'shared';

assert.equal(sharedValue, 'shared');

const promise = Promise.resolve().then(function () { return require('./other.js'); }).then(result =>
	assert.deepEqual(result, { value: 'shared', extra: 'extra' })
);

exports.promise = promise;
exports.sharedValue = sharedValue;
