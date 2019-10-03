System.register(['./entry-foo-system-ts.ts.js', './nested/entry-bar-system-ts.ts.js', './nested/entry-baz-system-ts.ts.js', './entry-no-ext-system-.js'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('foo', module.default);
		}, function (module) {
			exports('bar', module.default);
		}, function (module) {
			exports('baz', module.default);
		}, function (module) {
			exports('noExt', module.default);
		}],
		execute: function () {



		}
	};
});
