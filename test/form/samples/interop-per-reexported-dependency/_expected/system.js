System.register('bundle', ['external-auto', 'external-default', 'external-defaultOnly', 'external-esModule'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('externalAuto', module);
			var _setter = {};
			_setter.barAuto = module.barAuto;
			_setter.fooAuto = module.default;
			exports(_setter);
		}, function (module) {
			exports('externalDefault', module);
			var _setter = {};
			_setter.barDefault = module.barDefault;
			_setter.fooDefault = module.default;
			exports(_setter);
		}, function (module) {
			exports('fooDefaultOnly', module.default);
		}, function (module) {
			exports('externalEsModule', module);
			var _setter = {};
			_setter.barEsModule = module.barEsModule;
			_setter.fooEsModule = module.default;
			exports(_setter);
		}],
		execute: function () {



		}
	};
});
