(function () {
	'use strict';

	{
		console.log('kept');
	}

	{
		console.log('kept');
	}

	if (true) {
		console.log('kept');
	} else {
		var a;
		function b() {}
	}
	console.log(typeof a, typeof b);

	if (console.log('effect'), true) {
		console.log('kept');
	}

	if (console.log('effect'), true) {
		console.log('kept');
	} else {
	}

	{
		console.log('kept');
	}

	if (false) {
		var c;
		function d() {}
	}
	console.log(typeof c, typeof d);

	if (false) {
		var e;
		function f() {}
	} else {
		console.log('kept');
	}
	console.log(typeof e, typeof f);

	if (console.log('effect'), false) {
	}

	if (console.log('effect'), false) {
	} else {
		console.log('kept');
	}

}());
