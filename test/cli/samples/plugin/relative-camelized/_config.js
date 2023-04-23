module.exports = defineTest({
	description: 'handles plugins where the export name is the camelized file name',
	skipIfWindows: true,
	command:
		`echo 'console.log("initial");' | rollup ` +
		'-p "./plugins/my-super-plugin1.js" ' +
		'-p "./plugins/rollup-plugin-my-super-plugin2.js" ' +
		'-p "./plugins/rollup-plugin-" ' +
		'-p "./plugins/@rollup/plugin-supreme"'
});
