define(['require', 'exports', './generated-manual'], (function (require, exports, manual) { 'use strict';

	const promise = Promise.all([new Promise(function (resolve, reject) { require(['./generated-manual'], resolve, reject); }), new Promise(function (resolve, reject) { require(['./generated-d'], resolve, reject); })]).then(() => {
		assert.strictEqual(globalThis.xLoaded, true);
		assert.strictEqual(globalThis.mALoaded, true);
		assert.strictEqual(globalThis.mBLoaded, true);
	});

	exports.promise = promise;

}));
