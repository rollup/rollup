const items = { children: [ {}, {}, {} ] };

function a () {
	for ( const item of items.children ) {
		item.foo = 'a';
	}
}

a();

function b () {
	for ( const item of items.children ) {
		// do nothing
	}
}

b();

function c () {
	let item;
	for ( item of items.children ) {
		item.bar = 'c';
	}
}

c();

function d () {
	let item;
	for ( item of items.children ) {
		// do nothing
	}
}

d();

assert.deepEqual( items, [
	{ foo: 'a', bar: 'c' },
	{ foo: 'a', bar: 'c' },
	{ foo: 'a', bar: 'c' }
] );
