define(['exports'], (function (exports) { 'use strict';

	function fooInOtherEntry() {
		console.log('hello world');
	}

	exports.fooInOtherEntry = fooInOtherEntry;

}));
