module.exports = defineTest({
	description: 'external option gets passed from config',
	command: 'rollup -c -e assert,external-module'
});
