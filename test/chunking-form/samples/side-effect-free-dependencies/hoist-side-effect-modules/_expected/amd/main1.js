define(['./generated-dep2-effect', './generated-dep4-effect'], (function (dep2Effect, dep4Effect) { 'use strict';

	var value = 42;

	function onlyUsedByOne(value) {
		console.log('Hello', value);
	}

	onlyUsedByOne(value);

}));
