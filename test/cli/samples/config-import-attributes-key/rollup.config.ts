import foo from './foo.json' with { type: 'json' };

export default {
	input: `${foo.name}.js`,
	output: {
		format: 'cjs',
	}
};
