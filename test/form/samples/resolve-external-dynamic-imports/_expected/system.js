System.register('bundle', ['external'], (function (exports, module) {
	'use strict';
	var myExternal;
	return {
		setters: [function (module) {
			myExternal = module.default;
		}],
		execute: (function () {

			const test = () => myExternal; exports("test", test);

			const someDynamicImport = () => module.import('external'); exports("someDynamicImport", someDynamicImport);

		})
	};
}));
