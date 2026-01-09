System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (async function () {

			// removed
			// replace with await 0
			await 0;
			await 0;

			// retained
			module.import('./generated-sub2.js');
			module.import('external2');
			await module.import('./generated-sub2.js');
			await module.import('external2');

		})
	};
}));
