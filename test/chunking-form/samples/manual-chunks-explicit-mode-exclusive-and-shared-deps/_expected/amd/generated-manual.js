define(['exports', './generated-shared', './generated-exclusive'], (function (exports, shared, exclusive) { 'use strict';

	const m = shared.shared + exclusive.exclusive;

	exports.m = m;

}));
