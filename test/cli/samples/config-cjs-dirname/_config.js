module.exports = {
	description: 'does not transpile cjs configs and provides correct __dirname',
	// TODO Lukas add auto-discovery
	command: 'rollup --config rollup.config.cjs'
};
