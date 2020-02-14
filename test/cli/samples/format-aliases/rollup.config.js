export default {
	input: 'main.js',
	external: 'external',
	output: [
		undefined,
		'esm',
		'es',
		'module',
		'cjs',
		'commonjs',
		'system',
		'systemjs',
		'amd',
		'iife',
		'umd'
	].map(format => ({
		file: `_actual/${format}.js`,
		format,
		name: 'bundle',
		globals: {
			external: 'external'
		}
	}))
};
