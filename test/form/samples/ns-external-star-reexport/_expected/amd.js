define(['external-ns-1', 'external-ns-2'], function (externalNs1, externalNs2) { 'use strict';

	const val = 5;

	var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(externalNs1, externalNs2, {
		__proto__: null,
		val: val
	}));

	return ns;

});
