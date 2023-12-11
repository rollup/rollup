define(['require', 'exports'], (function (require, exports) { 'use strict';

	const sharedValue = 'shared';

	assert.equal(sharedValue, 'shared');

	const promise = new Promise(function (resolve, reject) { require(['./other'], resolve, reject); }).then(result =>
		assert.deepEqual(result, { value: 'shared', extra: 'extra' })
	);

	exports.promise = promise;
	exports.sharedValue = sharedValue;

}));
