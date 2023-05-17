System.register(['./other.js', 'external'], (function (exports) {
	'use strict';
	return {
		setters: [null, function (module) {
			exports('foo', module.foo);
		}],
		execute: (function () {



		})
	};
}));
