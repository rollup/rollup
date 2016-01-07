import * as second from './second';

assert.equal( second.first.value, 42 );
console.log( 'second', second )
assert.deepEqual( second, { first: { value: 42 } });
