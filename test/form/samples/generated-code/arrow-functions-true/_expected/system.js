System.register('bundle', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			let a; exports('a', a);

			(v => (exports('a', a), v))({a} = someObject);
			console.log((v => (exports('a', a), v))({a} = someObject));

		}
	};
});
