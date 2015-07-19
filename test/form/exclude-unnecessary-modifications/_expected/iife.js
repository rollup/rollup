(function () { 'use strict';

	var foo = {};

	mutate1( foo );

	// should be included
	[ 'a', 'b', 'c' ].forEach( function ( letter, i ) {
		foo[ letter ] = i;
	});

	[ 'd', 'e', 'f' ].forEach( ( letter, i ) => {
		foo[ letter ] = i;
	});

	function mutate1 ( obj ) {
		obj.mutated = 1;
	}

	console.log( foo );

})();
