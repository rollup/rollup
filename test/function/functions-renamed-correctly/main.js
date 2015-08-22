import { before } from './before';
import { x } from './factorial';
import { after } from './after';

before();
assert.equal( x( 5 ), 120 );
after();
