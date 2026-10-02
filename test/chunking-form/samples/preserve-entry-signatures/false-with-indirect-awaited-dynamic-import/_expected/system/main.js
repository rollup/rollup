System.register(['./generated-constants.js'], (function (exports, module) {
	'use strict';
	var TABLE;
	return {
		setters: [function (module) {
			TABLE = module.T;
		}],
		execute: (async function () {

			const createThing = asyncThing => {
				if (!asyncThing) {
					return {
						setup: () => module.import('./generated-dynamic.js').then(({ setup }) => setup())
					};
				}

				return { setup: asyncThing };
			};

			const thing = createThing(globalThis.asyncThing);
			await thing.setup(TABLE);

		})
	};
}));
