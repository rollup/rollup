'use strict';

const items = [{}, {}, {}];

function a () {
	for ( const item of items ) {
		item.foo = 'a';
	}
}

a();

function c () {
	let item;
	for ( item of items ) {
		item.bar = 'c';
	}
}

c();

assert.deepEqual( items, [
	{ foo: 'a', bar: 'c' },
	{ foo: 'a', bar: 'c' },
	{ foo: 'a', bar: 'c' }
]);
