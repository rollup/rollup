define(['exports', './main'], function (exports, main) { 'use strict';

	var component = { lib: main.lib, someExport: main.lib.someExport };

	var component$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), component, {
		'default': component
	}));

	exports.component = component$1;

});
