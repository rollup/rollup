module.exports = defineTest({
	// solo: true,
	description: 'transpiles JSX for react',
	options: {
		jsx: {
			factory: 'React.createElement',
			fragmentFactory: 'React.Fragment'
		}
	}
});
