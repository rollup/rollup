System.register('foo', ['external'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			var _setter = {};
			_setter.p = module.default;
			_setter.q = module.p;
			exports(_setter);
		}],
		execute: function () {



		}
	};
});
