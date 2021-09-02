System.register(['foo'], (function () {
	'use strict';
	var foo, foo__default;
	return {
		setters: [function (module) {
			foo = module;
			foo__default = module["default"];
		}],
		execute: (function () {

			console.log( foo.bar );

			console.log( foo__default );

		})
	};
}));
