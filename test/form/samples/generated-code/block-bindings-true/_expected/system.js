System.register('bundle', ['external'], (() => {
	'use strict';
	var foo;
	return {
		setters: [(module => {
			foo = module["default"];
		})],
		execute: (() => {

			console.log(foo);

		})
	};
}));
