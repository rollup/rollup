'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var external1 = require('external1');
var external2 = require('external2');

var reexportExternal = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), external1));

const extra = 'extra';

const override = 'override';
var reexportExternalsWithOverride = { synthetic: 'synthetic' };

var reexportExternalsWithOverride$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), external1, external2, {
	override: override,
	'default': reexportExternalsWithOverride,
	extra: extra
}, reexportExternalsWithOverride));

exports.external = reexportExternal;
exports.externalOverride = reexportExternalsWithOverride$1;
