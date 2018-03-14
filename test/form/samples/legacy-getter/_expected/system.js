System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var browserSpecificThing;

			if ('ActiveXObject' in window) {
				browserSpecificThing = "InternetExplorerThing";
			} else {
				browserSpecificThing = "DecentBrowserThing";
			}

			function foo() {}

			var browserStuff = /*#__PURE__*/(Object.freeze || Object)({
				browserSpecificThing: browserSpecificThing,
				foo: foo
			});
			exports('B', browserStuff);

			console.log(browserSpecificThing);

		}
	};
});
