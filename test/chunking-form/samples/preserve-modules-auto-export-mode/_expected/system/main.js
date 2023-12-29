System.register(['./default.js', './named.js'], (function (exports, module) {
	'use strict';
	var foo, value;
	return {
		setters: [function (module) {
			foo = module.default;
			exports("default", module.default);
		}, function (module) {
			value = module.value;
		}],
		execute: (function () {

			console.log(foo, value);

			module.import('./default.js').then(result => console.log(result.default));
			module.import('./named.js').then(result => console.log(result.value));

		})
	};
}));
