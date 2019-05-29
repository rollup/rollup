System.register([], function () {
	'use strict';
	return {
		execute: function () {

			let a;
			a();

			let b;
			b.foo = 'bar';

			let { c } = {};
			c();

			let { d } = {};
			d.foo = 'bar';

		}
	};
});
