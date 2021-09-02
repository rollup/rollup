System.register('bundle', ['external'], (function () {
	'use strict';
	var foo;
	return {
		setters: [module => {
			foo = module["default"];
		}],
		execute: (function () {

			console.log(foo);

		})
	};
}));
