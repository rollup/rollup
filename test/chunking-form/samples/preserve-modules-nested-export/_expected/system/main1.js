System.register(['./dep.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('foo', module.foo);
		}],
		execute: function () {



		}
	};
});
