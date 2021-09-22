(function () {
	'use strict';

	function x$2 () {
		return 'foo';
	}

	var foo = { x: x$2 };

	function x$1 () {
		return 'bar';
	}

	var bar = { x: x$1 };

	function x () {
		return 'baz';
	}

	var baz = { x };

	assert.equal( foo.x(), 'foo' );
	assert.equal( bar.x(), 'bar' );
	assert.equal( baz.x(), 'baz' );

})();
