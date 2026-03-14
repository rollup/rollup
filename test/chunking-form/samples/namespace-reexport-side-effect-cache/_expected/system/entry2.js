System.register(['./generated-effect.js'], (function () {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			foo = module.f;
		}],
		execute: (function () {

			console.log('entry2', foo);

		})
	};
}));
