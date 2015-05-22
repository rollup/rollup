import foo from 'path';

export default function () {
	return foo.relative( 'foo/bar/baz', 'foo/baz/bar' );
};
