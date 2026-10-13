export const createThing = asyncThing => {
	if (!asyncThing) {
		return {
			setup: () => import('./dynamic.js').then(({ setup }) => setup())
		};
	}

	return { setup: asyncThing };
};
