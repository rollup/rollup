'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var browserSpecificThing;

if ('ActiveXObject' in window) {
	browserSpecificThing = "InternetExplorerThing";
} else {
	browserSpecificThing = "DecentBrowserThing";
}

function foo() {}


var browserStuff = (Object.freeze || Object)({
	browserSpecificThing: browserSpecificThing,
	foo: foo
});

console.log(browserSpecificThing);

exports.B = browserStuff;
