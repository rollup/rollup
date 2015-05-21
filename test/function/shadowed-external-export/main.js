import { relative } from 'path';

function getRelativePath ( path, path2 ) {
	return relative( path, path2 );
}

assert.equal( getRelativePath( 'foo/bar/baz', 'foo/baz/bar' ), '../../baz/bar' );
