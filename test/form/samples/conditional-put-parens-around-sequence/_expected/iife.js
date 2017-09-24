(function () {
	'use strict';

	var a = (foo(), 3);
	var b = (bar(), 6);
	foo( a, b );

	// verify works with no whitespace
	bar((foo(), 2),(bar(), 8));

}());
