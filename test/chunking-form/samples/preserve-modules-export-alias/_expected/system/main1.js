System.register(['./dep.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			var _setter = {};
			_setter.foo = module.foo;
			_setter.bar = module.foo;
			exports(_setter);
		}],
		execute: function () {



		}
	};
});
