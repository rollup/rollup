System.register(['./generated-manual.js'], (function (exports, module) {
	'use strict';
	return {
		setters: [null],
		execute: (function () {

			const promise = exports("promise", Promise.all([module.import('./generated-manual.js'), module.import('./generated-d.js')]).then(() => {
				assert.strictEqual(globalThis.xLoaded, true);
				assert.strictEqual(globalThis.mALoaded, true);
				assert.strictEqual(globalThis.mBLoaded, true);
			}));

		})
	};
}));
