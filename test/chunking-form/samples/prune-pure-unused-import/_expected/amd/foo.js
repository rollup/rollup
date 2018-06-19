define(['external'], function (external) { 'use strict';

	if (external.bar) {
		console.log(true);
	}

	var foo = 1;

	return foo;

});
