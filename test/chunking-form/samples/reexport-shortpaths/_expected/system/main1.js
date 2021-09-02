System.register(['./generated-dep2.js'], (function (exports) {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			foo = module.f;
			exports('default', module.f);
		}],
		execute: (function () {



		})
	};
}));
