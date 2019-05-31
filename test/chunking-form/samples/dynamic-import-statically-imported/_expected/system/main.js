System.register(['./generated-chunk.js'], function () {
	'use strict';
	var foo, bar;
	return {
		setters: [function (module) {
			foo = module.f;
			bar = module.b;
		}],
		execute: function () {

			console.log(foo(), bar());

		}
	};
});
