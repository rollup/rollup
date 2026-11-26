module.exports = defineTest({
	description: 'supports JSX when the import source is also imported with attributes',
	options: {
		jsx: {
			jsxImportSource: './jsx-runtime.js',
			preset: 'react-jsx'
		}
	}
});
