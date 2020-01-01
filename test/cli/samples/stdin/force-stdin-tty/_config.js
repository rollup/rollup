module.exports = {
	description: 'allows forcing stdin input on TTY interfaces via option',
	command: `echo "console.log('PASS');" | ./wrapper.js -f es --stdin`
};
