System.register(['./chunks/chunk.js'], function (exports, module) {
	'use strict';
	var sharedValue;
	return {
		setters: [function (module) {
			sharedValue = module.s;
		}],
		execute: function () {

			assert.equal(sharedValue, 'shared');

			const promise = exports('promise', module.import('./chunks/other.js').then(result =>
				assert.deepEqual(result, { value: 'shared' })
			));

		}
	};
});
