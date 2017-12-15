'use strict';

var main = (input) => {
	try {
		JSON.parse(input);
		return true;
	} catch (e) {
		return false;
	}
};

module.exports = main;
