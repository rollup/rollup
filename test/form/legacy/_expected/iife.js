(function () {
	'use strict';

	const foo = 42;


	var namespace = (Object.freeze || Object)({
		'foo': foo
	});

	const x = 'foo';
	assert.equal( namespace[x], 42 );

}());
