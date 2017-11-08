(function () {
	'use strict';

	const mutateThis = () => {
		undefined.x = 1;
	};

	function Test () {
		mutateThis();
	}

	const test = new Test();

}());
