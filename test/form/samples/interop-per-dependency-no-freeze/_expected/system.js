System.register(['external-auto', 'external-default', 'external-defaultOnly', 'external-esModule'], (function (exports, module) {
	'use strict';
	var fooAuto__default, barAuto, fooAuto, fooDefault__default, barDefault, fooDefault, fooDefaultOnly__default, fooDefaultOnly, fooEsModule__default, barEsModule, fooEsModule;
	return {
		setters: [function (module) {
			fooAuto__default = module["default"];
			barAuto = module.barAuto;
			fooAuto = module;
		}, function (module) {
			fooDefault__default = module["default"];
			barDefault = module.barDefault;
			fooDefault = module;
		}, function (module) {
			fooDefaultOnly__default = module["default"];
			fooDefaultOnly = module;
		}, function (module) {
			fooEsModule__default = module["default"];
			barEsModule = module.barEsModule;
			fooEsModule = module;
		}],
		execute: (function () {

			console.log(fooAuto__default, barAuto, fooAuto);
			console.log(fooDefault__default, barDefault, fooDefault);
			console.log(fooDefaultOnly__default, fooDefaultOnly);
			console.log(fooEsModule__default, barEsModule, fooEsModule);

			module.import('external-auto').then(console.log);
			module.import('external-default').then(console.log);
			module.import('external-defaultOnly').then(console.log);
			module.import('external-esModule').then(console.log);

		})
	};
}));
