System.register('bundle', ['./components/index.js', './components/sub/index.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("baz", module.baz);
		}, function (module) {
			exports("foo", module.foo);
		}],
		execute: (function () {



		})
	};
}));
