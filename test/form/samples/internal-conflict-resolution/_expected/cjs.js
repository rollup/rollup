'use strict';

var bar = 42;

function foo () {
	return bar;
}

function bar$2 () {
	alert( foo() );
}

bar$2();
