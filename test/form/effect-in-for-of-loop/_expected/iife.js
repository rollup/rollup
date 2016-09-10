(function () {
	'use strict';

	const items = [{}, {}, {}];

	function x () {
		for ( const item of items.children ) {
			item.foo = 'bar';
		}
	}

	x();

	assert.deepEqual( items, [
		{ foo: 'bar' },
		{ foo: 'bar' },
		{ foo: 'bar' }
	]);

}());
