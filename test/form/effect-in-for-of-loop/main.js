const items = [{}, {}, {}];

function x () {
	for ( const item of items.children ) {
		item.foo = 'bar';
	}
}

x();

function y () {
	for ( const item of items.children ) {
		// do nothing
	}
}

y();

assert.deepEqual( items, [
	{ foo: 'bar' },
	{ foo: 'bar' },
	{ foo: 'bar' }
]);
