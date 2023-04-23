module.exports = defineTest({
	description: 'default exports of objects with null prototypes are supported',
	options: {
		external: ['foo'],
		output: {
			format: 'iife',
			globals: { foo: 'foo' }
		},
		plugins: [
			{
				renderChunk: code => `
					const foo = { __proto__: null, bar: 42 };
					${code}
				`
			}
		]
	}
});
