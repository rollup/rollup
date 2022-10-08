System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			module.import('external');
			module.import(globalThis.unknown);
			module.import('resolvedString');
			module.import('resolved-id');
			module.import('resolved-different');
			module.import('unresolved');

		})
	};
}));
