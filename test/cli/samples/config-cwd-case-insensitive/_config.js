const os = require('os');

function toggleCase(s) {
	return s == s.toLowerCase() ? s.toUpperCase() : s.toLowerCase();
}

module.exports = {
	skip: os.platform() !== 'win32',
	description: "can load config with cwd that doesn't match realpath",
	command: 'rollup -c',
	cwd: __dirname.replace(/^[A-Z]:\\/i, toggleCase),
	execute: true
};
