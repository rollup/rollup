const flags = {};

function test() {
	if (!flags.x) {
		throw new Error('Flag "x" not set');
	}
	assert.ok(flags.x);
}

export { flags, test };
