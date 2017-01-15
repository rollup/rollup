const items = [{}, {}, {}];

for ( const a of items ) {
	a.foo = 'a';
}

for ( const b of items ) {
	// do nothing
}

let c;
for ( c of items ) {
	c.bar = 'c';
}

let d;
for ( d of items ) {
	// do nothing
}

assert.deepEqual( items, [
	{ foo: 'a', bar: 'c' },
	{ foo: 'a', bar: 'c' },
	{ foo: 'a', bar: 'c' }
]);
