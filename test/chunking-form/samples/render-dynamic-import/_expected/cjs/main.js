'use strict';

function _interopNamespace(e) {
	if (e && e.__esModule) { return e; } else {
		var n = {};
		if (e) {
			Object.keys(e).forEach(function (k) {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () {
						return e[k];
					}
				});
			});
		}
		n['default'] = e;
		return n;
	}
}

cjsSpecialHandler('./generated-imported-via-special-handler.js', 'main.js', 'imported-via-special-handler.js', null);
cjsSpecialHandler(someVariable, 'main.js', 'null', null);
cjsSpecialHandler(someCustomlyResolvedVariable, 'main.js', 'null', someCustomlyResolvedVariable);
