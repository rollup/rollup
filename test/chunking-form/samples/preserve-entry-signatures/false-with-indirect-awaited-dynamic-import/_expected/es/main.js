import { T as TABLE } from './generated-constants.js';

const createThing = asyncThing => {
	if (!asyncThing) {
		return {
			setup: () => import('./generated-dynamic.js').then(({ setup }) => setup())
		};
	}

	return { setup: asyncThing };
};

const thing = createThing(globalThis.asyncThing);
await thing.setup(TABLE);
