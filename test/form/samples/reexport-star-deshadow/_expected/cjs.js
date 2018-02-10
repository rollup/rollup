'use strict';

function foo() { return true; }

var baz = function foo$$1() {
	return foo();
};

console.log(baz());
