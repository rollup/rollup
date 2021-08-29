System.register('bundle', [], (exports => {
	'use strict';
	return {
		execute: (() => {

			const foo = 1; exports({ foo, bar: foo, default: foo });

		})
	};
}));
