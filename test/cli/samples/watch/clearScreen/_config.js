module.exports = {
	// solo: true,
	description: 'does not fail in watch-mode with clearScreen: false',
	command: 'rollup -cw',
	abortOnStderr(data) {
		if (data.includes('created')) {
			return true;
		}
	},
};
