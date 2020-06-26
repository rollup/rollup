System.register(['./generated-lib.js'], function (exports) {
	'use strict';
	var lib;
	return {
		setters: [function (module) {
			lib = module.l;
		}],
		execute: function () {



			exports('foo', lib.foo);

		}
	};
});
