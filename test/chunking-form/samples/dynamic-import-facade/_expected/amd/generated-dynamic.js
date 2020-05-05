define(['exports'], function (exports) { 'use strict';

	console.log('dep');

	const dep = 'dep';

	console.log('dynamic', dep);
	const dynamic = 'dynamic';

	var dynamic$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		dynamic: dynamic
	});

	exports.dep = dep;
	exports.dynamic = dynamic;
	exports.dynamic$1 = dynamic$1;

});
