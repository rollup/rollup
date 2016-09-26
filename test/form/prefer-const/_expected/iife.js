const myBundle = (function (external,other,another) {
	'use strict';

	const a = 1;
	const b = 2;


	const namespace = (Object.freeze || Object)({
		a: a,
		b: b
	});

	console.log( Object.keys( namespace ) );

	const main = 42;

	return main;

}(external,other,another));
