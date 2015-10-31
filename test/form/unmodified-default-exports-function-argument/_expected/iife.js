(function () { 'use strict';

	var foo = function () {
		return 42;
	};

	function bar () {
		return contrivedExample( foo );
	}

	var answer = foo();
	var somethingElse = bar();

	console.log( answer );

})();
