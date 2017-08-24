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

for ( e of items.children ) {
	e.baz = 'e';
}
var e;

for ( f of items.children ) {
	// do nothing
}
var f;

assert.deepEqual( items, [
	{ foo: 'a', bar: 'c', baz: 'e' },
	{ foo: 'a', bar: 'c', baz: 'e' },
	{ foo: 'a', bar: 'c', baz: 'e' }
]);
