module.exports = defineTest({
	description: 'deshadows aliased import bindings',
	options: {
		external: ['react-sticky'],
		output: {
			globals: { 'react-sticky': 'reactSticky' },
			name: 'Sticky'
		}
	}
});
