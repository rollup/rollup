'use strict';

var main = require('./main.js');

var component = { lib: main.lib, someExport: main.lib.someExport };

var component$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), component, {
	'default': component
}), '__esModule', { value: true }));

exports.component = component$1;
