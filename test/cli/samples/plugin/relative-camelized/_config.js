module.exports = {
	description: 'handles plugins where the export name is the camelized file name',
	skipIfWindows: true,
	command: `echo 'console.log("ignored");' | rollup -p "./nested/my-super-plugin"`
};
