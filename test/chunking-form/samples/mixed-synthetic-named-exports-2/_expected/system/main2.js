System.register(['./generated-dep2.js'], function () {
	'use strict';
	var dep2;
	return {
		setters: [function (module) {
			dep2 = module.d;
		}],
		execute: function () {

			console.log(dep2.bar.foo);

		}
	};
});
