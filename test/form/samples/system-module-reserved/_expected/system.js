System.register('systemReserved', ['test'], (function () {
	'use strict';
	var module$1, other;
	return {
		setters: [function (module) {
			module$1 = module.module;
			other = module.other;
		}],
		execute: (function () {

			console.log(module$1, other);

		})
	};
}));
