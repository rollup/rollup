System.register(['./generated-square.js'], (function (exports, module) {
	'use strict';
	var square;
	return {
		setters: [function (module) {
			square = module.s;
		}],
		execute: (async function () {

			async function doMaths() {
				const maths = await module.import('./generated-maths.js');
				assert.equal(maths.square(5), 25);
				assert.equal(maths.cube(5), 125);
			}

			assert.equal(square(2), 4);
			await doMaths();

		})
	};
}));
