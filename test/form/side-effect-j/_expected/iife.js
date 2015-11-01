var myBundle = (function () { 'use strict';

	var augment;
	augment = x => x.augmented = true;

	function x () {}
	augment( x );

	return x;

})();