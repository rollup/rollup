import { relative } from 'path';

var path = 'foo/bar/baz';
var path2 = 'foo/baz/bar';

assert.equal( relative( path, path2 ), '../../baz/bar' );