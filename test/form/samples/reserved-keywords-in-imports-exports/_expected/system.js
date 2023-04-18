System.register('reservedKeywords', ['external'], (function (exports) {
	'use strict';
	var finally$1, catch$1;
	return {
		setters: [function (module) {
			finally$1 = module.finally;
			catch$1 = module.catch;
			exports({ const: module.const, in: module.for, return: module.bar, yield: module });
		}],
		execute: (function () {

			console.log(finally$1, catch$1); // retain those local bindings

			const legal = exports('await', 10);

		})
	};
}));
