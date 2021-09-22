define(['external-side-effect'], (function (externalSideEffect) { 'use strict';

	function onlyUsedByOne() {
		console.log('Hello');
	}

	onlyUsedByOne();

}));
