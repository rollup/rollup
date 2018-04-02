(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' && !module.nodeType ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function isUsed ( x ) {
		if ( x ) {
			return 2;
		}
		return 1;
	}

	assert.equal( isUsed( true ), 2 );

})));
