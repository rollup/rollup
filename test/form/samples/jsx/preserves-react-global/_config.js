module.exports = defineTest({
	solo: true,
	description: 'preserves React variable when preserving JSX output',
	options: {
		jsx: {
			factory: 'React.createElement',
			fragmentFactory: 'React.Fragment',
			preserve: true
		}
	}
});
