System.register(['unchanged', 'changed', 'special-character', 'with/slash', './relative.js'], (function () {
	'use strict';
	var foo, changedName, bar, baz, quux;
	return {
		setters: [function (module) {
			foo = module.foo;
		}, function (module) {
			changedName = module["default"];
		}, function (module) {
			bar = module.bar;
		}, function (module) {
			baz = module.baz;
		}, function (module) {
			quux = module.quux;
		}],
		execute: (function () {

			console.log(foo, changedName, bar, baz, quux);

		})
	};
}));
