System.register('Q', ['quoted\'\\
\ \ external1', './quoted\'\\
\ \ external2', './C:/File/Path.js'], function () {
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
		execute: function () {

			console.log(foo, bar, baz);

		}
	};
});
