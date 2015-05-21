var Promise = require( 'sander' ).Promise;

module.exports = function sequence ( arr, callback ) {
	var len = arr.length;
	var results = new Array( len );

	var promise = Promise.resolve();

	function next ( i ) {
		return promise
			.then( function () {
				return callback( arr[i], i );
			})
			.then( function ( result ) {
				results[i] = result;
			});
	}

	var i;

	for ( i = 0; i < len; i += 1 ) {
		promise = next( i );
	}

	return promise.then( function () {
		return results;
	});
};
