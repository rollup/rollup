module.exports = defineTest({
	//solo: true, //x,
	description: 'transpiles JSX for react',
	options: {
		jsx: {
			factory: 'React.createElement',
			fragmentFactory: 'React.Fragment'
		}
	}
});
