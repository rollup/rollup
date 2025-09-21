System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (async function () {

			// removed

			// retained
			module.import('./generated-sub2.js');
			await module.import('./generated-sub2.js');
			module.import('external2');
			await module.import('external2');

		})
	};
}));
