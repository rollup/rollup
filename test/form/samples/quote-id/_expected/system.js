System.register('Q', ['quoted\'\r\n\u2028\u2029external1', 'quoted\'\r\n\u2028\u2029external2', 'C:\\File\\Path.js'], (function () {
	'use strict';
	var foo, bar, baz;
	return {
		setters: [function (module) {
			foo = module.foo;
		}, function (module) {
			bar = module.bar;
		}, function (module) {
			baz = module.baz;
		}],
		execute: (function () {

			console.log(foo, bar, baz);

		})
	};
}));
