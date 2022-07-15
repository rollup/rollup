System.register(['external-false', 'external-true'], (function (exports, module) {
	'use strict';
	var fooFalse__default, barFalse, fooFalse, fooTrue__default, barTrue, fooTrue;
	return {
		setters: [function (module) {
			fooFalse__default = module.default;
			barFalse = module.barFalse;
			fooFalse = module;
		}, function (module) {
			fooTrue__default = module.default;
			barTrue = module.barTrue;
			fooTrue = module;
		}],
		execute: (function () {

			console.log(fooFalse__default, barFalse, fooFalse);
			console.log(fooTrue__default, barTrue, fooTrue);

			module.import('external-false').then(console.log);
			module.import('external-true').then(console.log);

		})
	};
}));
