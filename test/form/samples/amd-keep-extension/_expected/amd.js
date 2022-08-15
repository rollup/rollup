define(['./foo.js', 'baz/quux'], (function (foo, baz) { 'use strict';

	const bar = 42;

	console.log(foo, bar, baz);

}));
