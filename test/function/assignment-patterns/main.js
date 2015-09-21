import { bar, baz, x, items, p, q, r, s } from './other';

function foo ( bar = 1, { baz } = { baz: 2 }, [[[,x = 3] = []] = []] = [], ...items ) {
	bar += 1;
	baz += 1;
	x += 1;

	let { p, q } = { p: 4, q: 5 };
	let [ r, s ] = [ 6, 7 ];

	p++;
	q += 1;
	r = 7;
	s = 6;

	return bar + baz + x + items.length + p + q + r + s;
}

assert.equal( foo(), 33 );
assert.equal( foo( 2 ), 34 );
assert.equal( foo( 2, { baz: 3 }, [[[99,10]]], 'a', 'b', 'c' ), 45 );
