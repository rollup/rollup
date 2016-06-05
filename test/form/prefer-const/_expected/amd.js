define(['external', 'other', 'another'], function (external, other, another) { 'use strict';

	const a = 1;
	const b = 2;


	const namespace = Object.freeze({
		a: a,
		b: b
	});

	console.log( Object.keys( namespace ) );

	const main = 42;

	return main;

});
