import { relative, normalize } from 'path';

var path = 'foo/bar/baz';
var path2 = 'foo/baz/bar';

assert.equal( relative( path, path2 ), normalize('../../baz/bar') );