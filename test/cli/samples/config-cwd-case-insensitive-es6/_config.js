function toggleCase(s) {
	return s == s.toLowerCase() ? s.toUpperCase() : s.toLowerCase();
}

module.exports = defineTest({
	onlyWindows: true,
	description: "can load ES6 config with cwd that doesn't match realpath",
	spawnArgs: ['-c'],
	cwd: __dirname.replace(/^[a-z]:\\/i, toggleCase),
	execute: true
});
