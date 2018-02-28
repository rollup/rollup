System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			let x = exports('x', 0);

			function noEffects () {}

			function modifyX () {
				return (exports(x, x + 1), x++);
			}

			const b = `${globalFunction()}has effects`;

			const c = `${modifyX()}has effects`;

			const e = noEffects`${globalFunction()}has effects`;

			const f = noEffects`${modifyX()}has effects`;

			const g = globalFunction`has effects`;

			const h = (() => {
				console.log( 'effect' );
				return () => {};
			})()`has effects`;

			const i = modifyX`has effects`;

		}
	};
});
