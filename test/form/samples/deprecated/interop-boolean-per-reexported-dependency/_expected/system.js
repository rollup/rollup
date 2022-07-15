System.register('bundle', ['external-false', 'external-true'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports({ barFalse: module.barFalse, externalFalse: module, fooFalse: module.default });
		}, function (module) {
			exports({ barTrue: module.barTrue, externalTrue: module, fooTrue: module.default });
		}],
		execute: (function () {



		})
	};
}));
