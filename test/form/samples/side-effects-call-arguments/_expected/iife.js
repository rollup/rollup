(function () {
	'use strict';

	function foo () {}
	foo( globalFunction() );

	var baz = 2;
	foo( baz++ );

	assert.equal(baz, 3);

}());
