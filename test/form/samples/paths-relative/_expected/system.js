System.register(['../foo'], function (exports, module) {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			foo = module.default;
		}],
		execute: function () {

			assert.equal( foo, 42 );

		}
	};
});
