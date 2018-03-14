System.register(['./dep.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('bar', module.foo);
		}],
		execute: function () {



		}
	};
});
