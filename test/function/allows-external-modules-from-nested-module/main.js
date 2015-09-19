import { relative, normalize } from 'path';
import foo from './foo';

var path = 'foo/bar/baz';
var path2 = 'foo/baz/bar';

assert.equal( relative( path, path2 ), normalize('../../baz/bar') );
assert.equal( foo, normalize('../../c/b') );