function isRemoved ( x ) {
	if ( x ) {
		return 2;
	}
	return 1;
}

isRemoved( true );

function isUsed ( x ) {
	if ( x ) {
		return 2;
	}
	return 1;
}

assert.equal( isUsed( true ), 2 );
assert.equal( isUsed( false ), 1 );
