System.register('bundle', ['external-auto', 'external-default', 'external-defaultOnly', 'external-esModule'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports({ __proto__: null, barAuto: module.barAuto, externalAuto: module, fooAuto: module.default });
		}, function (module) {
			exports({ __proto__: null, barDefault: module.barDefault, externalDefault: module, fooDefault: module.default });
		}, function (module) {
			exports('fooDefaultOnly', module.default);
		}, function (module) {
			exports({ __proto__: null, barEsModule: module.barEsModule, externalEsModule: module, fooEsModule: module.default });
		}],
		execute: (function () {



		})
	};
}));
