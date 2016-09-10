function numbers ( i ) {
	var array = new Array( i );
	while ( i-- ) array[i] = i + 1;
	return array;
}

assert.deepEqual( numbers( 5 ), [ 1, 2, 3, 4, 5 ] );
