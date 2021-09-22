(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	for ( let i = 0; i < 10; i += 1 ) console.log( i );
	for ( const letter of array ) console.log( letter );
	for ( const index in array ) console.log( index );

	let i;
	for ( i = 0; i < 10; i += 1 ) console.log( i );

	let letter;
	for ( letter of array ) console.log( letter );

	let index;
	for ( index in array ) console.log( index );

}));
