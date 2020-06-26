module.exports = {
	description: 'supports stripping "rollup-config" prefix to find named plugin export',
	skipIfWindows: true,
	command: `rollup -c -p rollup-plugin-terser`
};
