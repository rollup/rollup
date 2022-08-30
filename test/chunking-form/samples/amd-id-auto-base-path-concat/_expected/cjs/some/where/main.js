'use strict';

function getA() {
	return Promise.resolve().then(function () { return require('./generated-a.js'); });
}

exports.getA = getA;
