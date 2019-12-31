'use strict';

const sharedValue = 'shared';

assert.equal(sharedValue, 'shared');

const promise = new Promise(function (resolve) { resolve(require('./other.js')); }).then(result =>
	assert.deepEqual(result, { value: 'shared' })
);

exports.promise = promise;
exports.sharedValue = sharedValue;
