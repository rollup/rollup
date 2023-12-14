System.register('bundle', ['external'], (function (exports, module) {
	'use strict';
	var myExternal;
	return {
		setters: [function (module) {
			myExternal = module.default;
		}],
		execute: (function () {

			const test = exports("test", () => myExternal);

			const someDynamicImport = exports("someDynamicImport", () => module.import('external'));

		})
	};
}));
