'use strict';

var bar = 42;

function foo () {
	return bar;
}

function _bar () {
	alert( foo() );
}

_bar();
