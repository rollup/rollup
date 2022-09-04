System.register(['./foo-system-0e2d8e48.js', './nested/bar-system-a72f6c95.js', './nested/baz-system-71d114fd.js', './no-ext-system-0cf938a8.js'], (function (exports) {
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
		execute: (function () {



		})
	};
}));
