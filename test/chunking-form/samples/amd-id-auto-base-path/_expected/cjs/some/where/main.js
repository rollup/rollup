'use strict';

function getA() {
	return Promise.resolve().then(function () { return require('./chunks/generated-a.js'); });
}

exports.getA = getA;
