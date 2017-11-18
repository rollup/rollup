(function () {
	'use strict';

	let a = { foo: () => {}, bar: () => () => {} };
	let b = a;
	a = b;
	a.foo = () => {};
	a.foo();

	b = b;
	b.bar = () => () => {};

	b.bar()();

}());
