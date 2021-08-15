(function () {
	'use strict';

	var a = '1\
  2';

	var b = '1\
	2';

	var c = `1
  2`;

	var d = `1
	2`;

	assert.equal( a, '1\n  2' );
	assert.equal( b, '1\n\t2' );
	assert.equal( c, '1\n  2' );
	assert.equal( d, '1\n\t2' );

})();
