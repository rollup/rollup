module.exports = {
	description: 'CLI --plugin /absolute/path',
	skipIfWindows: true,
	command: `echo 'console.log(VALUE);' | rollup -p "\`pwd\`/my-plugin={VALUE: 'absolute', ZZZ: 1}"`
};
