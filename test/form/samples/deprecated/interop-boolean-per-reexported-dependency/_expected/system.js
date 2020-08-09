System.register('bundle', ['external-false', 'external-true'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('externalFalse', module);
			var _setter = {};
			_setter.barFalse = module.barFalse;
			_setter.fooFalse = module.default;
			exports(_setter);
		}, function (module) {
			exports('externalTrue', module);
			var _setter = {};
			_setter.barTrue = module.barTrue;
			_setter.fooTrue = module.default;
			exports(_setter);
		}],
		execute: function () {



		}
	};
});
