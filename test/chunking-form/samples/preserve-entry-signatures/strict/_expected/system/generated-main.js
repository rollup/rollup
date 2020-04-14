System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const shared = exports('s', 'shared');

			const nonEssential = exports('n', 'non-essential');
			const dynamic = exports('d', module.import('./generated-dynamic.js'));

			globalThis.sharedStatic = shared;

		}
	};
});
