module.exports = {
	description: 'supports native esm as well as CJS plugins when using .mjs in Node 13+',
	minNodeVersion: 13,
	// TODO Lukas add auto-discovery
	command: 'rollup --config rollup.config.mjs'
};
