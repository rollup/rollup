System.register(['./generated-dep1.js'], (() => {
	'use strict';
	var foo, bar;
	return {
		setters: [(module => {
			foo = module.f;
			bar = module.b;
		})],
		execute: (() => {

			console.log(foo, bar);

		})
	};
}));
