var result = 0;
if ( Math.random() <= 1 ) {
	if ( Math.random() <= 1 ) result += 1;
}

assert.equal( result, 1 );
