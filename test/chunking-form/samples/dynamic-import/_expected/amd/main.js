define(['require', 'exports', './chunks/chunk'], function (require, exports, __chunk_1) { 'use strict';

	assert.equal(__chunk_1.sharedValue, 'shared');

	const promise = new Promise(function (resolve, reject) { require(['./chunks/other'], resolve, reject) }).then(result =>
		assert.deepEqual(result, { value: 'shared' })
	);

	exports.promise = promise;

	Object.defineProperty(exports, '__esModule', { value: true });

});
