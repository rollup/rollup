'use strict';

var bar$1 = 42;

function foo () {
	return bar$1;
}

function bar () {
	alert( foo() );
}

bar();
