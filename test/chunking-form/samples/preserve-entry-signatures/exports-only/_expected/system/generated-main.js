System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const shared = exports("s", 'shared');

			const unused = exports("u", 'unused');
			const dynamic = exports("d", module.import('./generated-dynamic.js'));

			globalThis.sharedStatic = shared;

		})
	};
}));
