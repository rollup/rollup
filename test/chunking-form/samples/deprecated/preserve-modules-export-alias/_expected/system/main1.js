System.register(['./dep.js'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			var _setter = {};
			_setter.bar = module.foo;
			_setter.foo = module.foo;
			exports(_setter);
		}],
		execute: function () {



		}
	};
});
