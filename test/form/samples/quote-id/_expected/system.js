System.register('Q', ['quoted\'\r\n\u2028\u2029external1', './quoted\'\r\n\u2028\u2029external2'], function () {
	'use strict';
	var foo, bar;
	return {
		setters: [function (module) {
			foo = module.foo;
		}, function (module) {
			bar = module.bar;
		}],
		execute: function () {

			console.log(foo, bar);

		}
	};
});
