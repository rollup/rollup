import { relative } from 'path';
import { format } from 'util';

assert.equal( format( 'it %s', 'works' ), 'it works' );
assert.equal( relative( 'a/b/c', 'a/c/b' ), '../../c/b' );
