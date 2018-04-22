System.register(['external'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			var _setter = {};
			_setter.q = module.p;
			_setter.p = module.default;
			exports(_setter);
		}],
		execute: function () {



		}
	};
});
