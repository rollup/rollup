'use strict';

function foo () {
	return 42;
}

var str = `
//# sourceMappingURL=main.js.map
`;

console.log( foo(str) );
