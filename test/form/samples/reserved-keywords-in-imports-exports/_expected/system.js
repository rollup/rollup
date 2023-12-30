System.register('reservedKeywords', ['external'], (function (exports) {
	'use strict';
	var _finally, _catch;
	return {
		setters: [function (module) {
			_finally = module.finally;
			_catch = module.catch;
			exports({ const: module.const, in: module.for, return: module.bar, yield: module });
		}],
		execute: (function () {

			console.log(_finally, _catch); // retain those local bindings

			const legal = exports("await", 10);

		})
	};
}));
