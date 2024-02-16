// @ts-expect-error not included in types
const { hasEsBuild } = require('../../../utils');

module.exports = defineTest({
	skip: !hasEsBuild,
	description: 'uses mjs config file which return config wrapped by defineConfig',
	command: 'rollup --config rollup.config.mjs',
	execute: true
});
