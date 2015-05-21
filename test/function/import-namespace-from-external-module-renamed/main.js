import * as node_path from 'path';

var path1 = 'foo/bar/baz';
var path2 = 'foo/baz/bar';

assert.equal( node_path.relative( path1, path2 ), '../../baz/bar' );
