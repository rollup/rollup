export default [{
	input: 'main.js',
	format: 'cjs',
	output: '_actual/bundle1.js'
}, {
	input: 'main.js',
	format: 'cjs',
	plugins: [{
		resolveId(id) {
			throw new Error("Unexpected Exception");
		}
	}],
	output: '_actual/bundle2.js'
}];
