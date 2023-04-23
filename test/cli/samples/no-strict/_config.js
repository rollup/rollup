module.exports = defineTest({
	description: 'use no strict option',
	command: 'rollup -i main.js -f iife --no-strict --indent'
});
