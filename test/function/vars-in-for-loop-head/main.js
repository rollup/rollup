function clone ( things ) {
	var result = [];
	for ( var i = 0, list = things; i < list.length; i += 1 ) {
		var thing = list[i];
		result.push( thing );
	}
	return result;
}

assert.deepEqual( clone([ 1, 2, 3 ]), [ 1, 2, 3 ] );
