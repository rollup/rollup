export default function foo ( x ) {
	assert.equal( x, 42 );
	global.ran = true;
}( 42 );
