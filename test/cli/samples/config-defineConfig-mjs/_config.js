// @ts-expect-error not included in types
const { hasEsBuild } = require('../../../testHelpers');

module.exports = defineTest({
	skip: !hasEsBuild,
	description: 'uses mjs config file which return config wrapped by defineConfig',
	spawnArgs: ['--config', 'rollup.config.mjs'],
	execute: true
});
