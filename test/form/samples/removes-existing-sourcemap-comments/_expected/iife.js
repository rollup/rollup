(function () {
	'use strict';

	function foo (x) {
		return x;
	}

	var str = `
//# sourceMappingURL=main.js.map
`;

	console.log( foo(str) );

})();
