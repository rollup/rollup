export default [{
	entry: 'main.js',
	format: 'cjs',
	dest: '_actual/bundle1.js'
}, {
	entry: 'main.js',
	format: 'cjs',
	plugins: [{ 
		resolveId(id) {
			throw new Error("Unexpected Exception");
		}
	}],
	dest: '_actual/bundle2.js'
}];
