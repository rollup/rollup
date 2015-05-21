import { relative } from 'path';
import foo from './foo';

var path = 'foo/bar/baz';
var path2 = 'foo/baz/bar';

assert.equal( relative( path, path2 ), '../../baz/bar' );
assert.equal( foo, '../../c/b' );