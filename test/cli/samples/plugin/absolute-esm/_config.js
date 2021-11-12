module.exports = {
	description: 'ESM CLI --plugin /absolute/path',
	minNodeVersion: 12,
	skipIfWindows: true,
	command: `echo 'console.log(1 ? 2 : 3);' | rollup -p "\`pwd\`/my-esm-plugin.mjs={comment: 'Absolute ESM'}"`
};
