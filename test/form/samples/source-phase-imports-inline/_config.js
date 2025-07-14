module.exports = defineTest({
	description: 'supports building source phase with a source hook',
	options: {
		plugins: [
			{
				name: 'first',
				resolveId(id) {
					if (id === 'dep1') return require.resolve('./dep1.js');
				},
				sourcePhase(_id, source) {
					return `import './dep4.js'; export default \`${source}\``;
				}
			}
		]
	}
});
