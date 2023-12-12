System.register('foo.@scoped/npm-package.bar.why-would-you-do-this', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			let foo = exports("foo", 'foo');

		})
	};
}));
