System.register(['./entry-foo-system.js', './nested/entry-bar-system.js', './nested/entry-baz-system.js'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('foo', module.default);
		}, function (module) {
			exports('bar', module.default);
		}, function (module) {
			exports('baz', module.default);
		}],
		execute: function () {



		}
	};
});
