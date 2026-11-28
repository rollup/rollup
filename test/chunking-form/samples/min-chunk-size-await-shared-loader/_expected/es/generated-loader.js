function preload(callback) {
	return callback();
}

const load = () => import('./generated-entry.js');

export { load as l, preload as p };
