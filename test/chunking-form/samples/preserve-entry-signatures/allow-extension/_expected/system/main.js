System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const shared = exports("s", 'shared');

			const unused = exports("unused", 'unused');
			const dynamic = exports("dynamic", module.import('./generated-dynamic.js'));

			globalThis.sharedStatic = shared;

		})
	};
}));
