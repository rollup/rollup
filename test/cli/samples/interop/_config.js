module.exports = {
	description: 'does not include the interop block',
	command: 'rollup -i main.js -f cjs --no-interop'
};
