module.exports = {
	description: 'allows forcing inputs to be replaced with stdin in config files',
	command: `shx echo "console.log('STDIN');" | rollup -c --stdin`
};
