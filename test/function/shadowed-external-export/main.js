import { relative, normalize } from 'path';

var paths = {};
function getRelativePath ( path, path2 ) {
	paths[ path ] = true;
	return relative( path, path2 );
}

assert.equal( getRelativePath( 'foo/bar/baz', 'foo/baz/bar' ), normalize('../../baz/bar') );
assert.deepEqual( paths, { 'foo/bar/baz': true });
