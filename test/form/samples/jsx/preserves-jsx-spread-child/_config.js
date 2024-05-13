module.exports = defineTest({
	solo: true,
	description: 'preserves JSX spread children',
	options: {
		external: ['react'],
		jsx: 'preserve'
	},
	// apparently, acorn-jsx does not support spread children
	verifyAst: false
});
