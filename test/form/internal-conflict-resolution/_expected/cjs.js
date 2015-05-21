'use strict';

var _bar = 42;

function foo () {
	return _bar;
}

function bar () {
	alert( foo() );
}

bar();
