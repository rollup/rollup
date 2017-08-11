import { before } from './before';
import { x } from './factorial';
import { after } from './after';

before(); // before and after ensure x is renamed
assert.equal( x( 5 ), 120 );
after();
