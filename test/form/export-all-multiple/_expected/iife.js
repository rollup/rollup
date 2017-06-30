var myBundle = (function (exports,foo,bar,baz) {
	'use strict';



	Object.keys(foo).forEach(function (key) { exports[key] = foo[key]; });
	Object.keys(bar).forEach(function (key) { exports[key] = bar[key]; });
	Object.keys(baz).forEach(function (key) { exports[key] = baz[key]; });

}({},foo,bar,baz));
