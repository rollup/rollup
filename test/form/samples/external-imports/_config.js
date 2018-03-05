module.exports = {
	description: 'prefixes global names with `global.` when creating UMD bundle (#57)',
	options: {
		external: ['factory', 'baz', 'shipping-port', 'alphabet']
	}
};
