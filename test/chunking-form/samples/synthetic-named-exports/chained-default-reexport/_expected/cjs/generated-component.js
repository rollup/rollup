'use strict';

var main = require('./generated-main.js');

var component = { lib: main.lib, lib2: main.lib.named, lib3: main.lib.named.named };

var component$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), component, {
	'default': component
}));

exports.component = component$1;
