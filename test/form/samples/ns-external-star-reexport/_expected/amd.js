define(['external-ns-1', 'external-ns-2'], function (externalNs1, externalNs2) { 'use strict';

	const val = 5;

	var ns = /*#__PURE__*/Object.freeze(Object.assign(Object.create(null), externalNs1, externalNs2, {
		val: val
	}));

	return ns;

});
