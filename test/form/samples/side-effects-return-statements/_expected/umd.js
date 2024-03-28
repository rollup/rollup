(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	function isUsed ( x ) {
		if ( x ) {
			return 2;
		}
		return 1;
	}

	assert.equal( isUsed( true ), 2 );
	assert.equal( isUsed( false ), 1 );

}));
