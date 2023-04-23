module.exports = defineTest({
	description: 'does not include the interop block',
	command: 'rollup -i main.js -f cjs --external test --interop default'
});
