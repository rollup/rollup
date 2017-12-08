var myBundle = (function () {
	'use strict';

	var main = (input) => {
		try {
			JSON.stringify(input);
			return true;
		} catch (e) {
			return false;
		}
	};

	return main;

}());
