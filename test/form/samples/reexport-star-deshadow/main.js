import * as bar from './reexport.js';

var baz = function foo() {
	return bar.foo();
};

console.log(baz())