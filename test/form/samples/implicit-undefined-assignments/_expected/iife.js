(function () {
	'use strict';

	let a;
	a();

	let b;
	b.foo = 'bar';

	let { c } = {};
	c();

	let { d } = {};
	d.foo = 'bar';

})();
