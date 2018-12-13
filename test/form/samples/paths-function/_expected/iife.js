(function (foo) {
	'use strict';

	foo = foo && foo.hasOwnProperty('default') ? foo['default'] : foo;

	assert.equal( foo, 42 );

}(foo));
