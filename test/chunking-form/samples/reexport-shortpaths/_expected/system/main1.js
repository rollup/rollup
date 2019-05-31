System.register(['./generated-chunk.js'], function (exports) {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			foo = module.f;
		}],
		execute: function () {

			exports('default', foo);

		}
	};
});
