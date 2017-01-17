const items = [{}, {}, {}];

function a () {
	for ( const item of items ) {
		item.foo = 'a';
	}
}

a();

function b () {
	for ( const item of items ) {
		// do nothing
	}
}

b();

function c () {
	let item;
	for ( item of items ) {
		item.bar = 'c';
	}
}

c();

function d () {
	let item;
	for ( item of items ) {
		// do nothing
	}
}

d();

assert.deepEqual( items, [
	{ foo: 'a', bar: 'c' },
	{ foo: 'a', bar: 'c' },
	{ foo: 'a', bar: 'c' }
]);
