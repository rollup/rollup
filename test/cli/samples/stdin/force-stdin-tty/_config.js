module.exports = defineTest({
	description: 'allows forcing stdin input on TTY interfaces via option',
	skipIfWindows: true,
	command: `echo "console.log('PASS');" | ./wrapper.js -f es --stdin`
});
