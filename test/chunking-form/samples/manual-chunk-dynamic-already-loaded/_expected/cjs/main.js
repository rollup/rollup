'use strict';

require('./generated-manual.js');

const promise = Promise.all([Promise.resolve().then(function () { return require('./generated-manual.js'); }), Promise.resolve().then(function () { return require('./generated-d.js'); })]).then(() => {
	assert.strictEqual(globalThis.xLoaded, true);
	assert.strictEqual(globalThis.mALoaded, true);
	assert.strictEqual(globalThis.mBLoaded, true);
});

exports.promise = promise;
