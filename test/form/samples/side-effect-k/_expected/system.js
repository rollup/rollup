System.register('myBundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			exports("default", x);

			function augment ( x ) {
				var prop, source;

				var i = arguments.length;
				var sources = Array( i - 1 );
				while ( i-- ) {
					sources[i-1] = arguments[i];
				}

				while (source = sources.shift()) {
					for (prop in source) {
						if (hasOwn.call(source, prop)) {
							x[prop] = source[prop];
						}
					}
				}

				return x;
			}

			function x () {}
			augment( x.prototype );

		})
	};
}));
