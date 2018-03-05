System.register(['a-b-c'], function (exports, module) {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			foo = module.foo;
		}],
		execute: function () {

			foo();

		}
	};
});
