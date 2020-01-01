module.exports = {
	description: 'allows forcing inputs to be replaced with stdin in config files',
	skipIfWindows: true,
	command: `echo "console.log('STDIN');" | rollup -c --stdin`
};
