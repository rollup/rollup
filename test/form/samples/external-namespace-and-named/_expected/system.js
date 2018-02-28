System.register(['foo'], function (exports, module) {
	'use strict';
	var foo, blah, bar;
	return {
		setters: [function (module) {
			foo = module;
			blah = module.blah;
			bar = module.bar;
		}],
		execute: function () {

			console.log(foo);
			console.log(blah);
			console.log(bar);

		}
	};
});
