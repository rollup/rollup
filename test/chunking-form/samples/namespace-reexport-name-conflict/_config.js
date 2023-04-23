module.exports = defineTest({
	description: 'renders namespaces with reexports that conflict with existing imports',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js'],
		external: ['external'],
		output: {
			exports: 'named'
		}
	}
});
