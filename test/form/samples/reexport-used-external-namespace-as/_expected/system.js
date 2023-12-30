System.register('bundle', ['external1', 'external2'], (function (exports) {
	'use strict';
	var imported1, imported2;
	return {
		setters: [function (module) {
			imported1 = module;
			exports("external1", module);
		}, function (module) {
			imported2 = module.imported2;
			exports("external2", module);
		}],
		execute: (function () {

			console.log(imported1, imported2);

		})
	};
}));
