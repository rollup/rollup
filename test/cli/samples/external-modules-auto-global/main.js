import { max } from 'mathematics';
import { resolve } from 'promises';

assert.equal( max( 1, 2, 3 ), 3 );
assert.ok( resolve().then );
