System.register(['a-b-c'], function () {
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
