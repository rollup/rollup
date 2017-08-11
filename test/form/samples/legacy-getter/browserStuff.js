export var browserSpecificThing;

if ('ActiveXObject' in window) {
	browserSpecificThing = "InternetExplorerThing";
} else {
	browserSpecificThing = "DecentBrowserThing";
}

export function foo() {}
