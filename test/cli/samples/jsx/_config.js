module.exports = defineTest({
	description: 'supports jsx presets via CLI',
	command: 'rollup -i main.js --jsx react --external react'
});
