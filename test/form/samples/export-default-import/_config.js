module.exports = {
	description: 'correctly exports a default import, even in ES mode (#513)',
	options: {
		external: ['x'],
		output: { name: 'myBundle' }
	}
};
