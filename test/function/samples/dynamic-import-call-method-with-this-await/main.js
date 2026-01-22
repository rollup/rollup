export const test = async () => {
	const n = await import('./dep.js');
	assert.equal(n.test(), 'OK');
};
