module.exports = defineTest({
	description: 'transpiles JSX for react',
	options: {
		jsx: {
			factory: 'React.createElement',
			fragmentFactory: 'React.Fragment'
		}
	}
});
