System.register('bundle', ['./components/sub/index.js', './components/index.js'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('foo', module.foo);
		}, function (module) {
			exports('baz', module.baz);
		}],
		execute: function () {



		}
	};
});
