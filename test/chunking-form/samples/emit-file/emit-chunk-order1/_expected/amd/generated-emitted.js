define(['exports'], function (exports) { 'use strict';

	var value = 42;

	const id = 'emitted';
	console.log(id, value);

	exports.id = id;
	exports.value = value;

});
