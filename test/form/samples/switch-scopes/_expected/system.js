System.register('myBundle', [], function () {
	'use strict';
	return {
		execute: function () {

			const x = globalFunction;

			switch ( anotherGlobal ) {
				case 2:
					x();
			}

			switch ( globalFunction() ) {
				case 4:
			}

		}
	};
});
