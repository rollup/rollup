'use strict';

var foo = function () {
	return 42;
};

// we should not trim this string
var str = '//# sourceMappingURL=main.js.map';

console.log( foo(str) );
