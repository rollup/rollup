module.exports = {
	description: 'use legal names for exported functions and classed (#1943)',
	// It seems Node 6 sometimes does not like functions overriding vars
	minNodeVersion: 8,
	options: { output: { name: 'bundle' } }
};
