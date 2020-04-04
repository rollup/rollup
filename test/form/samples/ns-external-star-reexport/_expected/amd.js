define(['external-ns-1', 'external-ns-2'], function (externalNs1, externalNs2) { 'use strict';

	const val = 5;

	var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), externalNs1, externalNs2, {
		val: val
	}));

	return ns;

});
