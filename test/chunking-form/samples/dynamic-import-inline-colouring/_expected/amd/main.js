define(['require'], function (require) { 'use strict';

	var foo = "FOO";

	var foo$1 = /*#__PURE__*/Object.freeze({
		default: foo
	});

	var main = Promise.resolve().then(function () { return foo$1; });

	return main;

});
