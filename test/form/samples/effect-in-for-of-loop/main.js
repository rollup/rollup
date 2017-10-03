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

for ( e of items ) {
	e.baz = 'e';
}
var e;

for ( f of items ) {
	// do nothing
}
var f;

assert.deepEqual( items, [
	{ foo: 'a', bar: 'c', baz: 'e' },
	{ foo: 'a', bar: 'c', baz: 'e' },
	{ foo: 'a', bar: 'c', baz: 'e' }
]);
