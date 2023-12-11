System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const sharedValue = exports('s', 'shared');

			assert.equal(sharedValue, 'shared');

			const promise = exports('p', module.import('./other.js').then(result =>
				assert.deepEqual(result, { value: 'shared', extra: 'extra' })
			));

		})
	};
}));
