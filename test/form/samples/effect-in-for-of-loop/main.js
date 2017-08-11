const items = [{}, {}, {}];

for ( const a of items.children ) {
	a.foo = 'a';
}

for ( const b of items.children ) {
	// do nothing
}

let c;
for ( c of items.children ) {
	c.bar = 'c';
}

let d;
for ( d of items.children ) {
	// do nothing
}

assert.deepEqual( items, [
	{ foo: 'a', bar: 'c' },
	{ foo: 'a', bar: 'c' },
	{ foo: 'a', bar: 'c' }
]);
