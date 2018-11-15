define(['require'], function (require) { 'use strict';

	var foo = "FOO";
	const x = 2;

	var foo$1 = /*#__PURE__*/Object.freeze({
		default: foo,
		x: x
	});

	var main = Promise.resolve().then(function () { return foo$1; });

	return main;

});
