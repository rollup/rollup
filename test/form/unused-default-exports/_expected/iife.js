(function () {
	'use strict';

	var foo = { value: 1 };

	function mutate ( obj ) {
		obj.value += 1;
		return obj;
	}

	mutate( foo );

	assert.equal( foo.value, 2 );

}());
