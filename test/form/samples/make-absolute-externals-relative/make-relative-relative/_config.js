const assert = require('node:assert');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description:
		'only normalizes external paths that were originally relative when set to "ifRelativeSource"',
	options: {
		makeAbsoluteExternalsRelative: 'ifRelativeSource',
		external(id) {
			if (
				[
					'./relativeUnresolved.js',
					'../relativeUnresolved.js',
					path.join(__dirname, 'relativeMissing.js'),
					path.join(__dirname, 'relativeExisting.js'),
					'/absolute.js',
					'/pluginAbsolute.js'
				].includes(id)
			)
				return true;
		},
		plugins: [
			{
				name: 'test',
				async buildStart() {
					const testExternal = async (source, expected) =>
						assert.deepStrictEqual(
							(await this.resolve(source, ID_MAIN, { skipSelf: false })).external,
							expected,
							source
						);

					await testExternal('./relativeUnresolved.js', true);
					await testExternal('./relativeMissing.js', true);
					await testExternal('./relativeExisting.js', true);
					await testExternal('/absolute.js', 'absolute');
					await testExternal('./pluginDirect.js', true);
					await testExternal('/pluginDifferentAbsolute.js', 'absolute');
					await testExternal('./pluginTrue.js', true);
					await testExternal('./pluginForceAbsolute.js', 'absolute');
					await testExternal('./pluginForceRelative.js', true);
				},
				resolveId(source) {
					if (source.endsWith('/pluginDirect.js')) return false;
					if (source.endsWith('/pluginDifferentAbsolute.js')) return '/pluginAbsolute.js';
					if (source.endsWith('/pluginTrue.js'))
						return { id: path.join(__dirname, 'pluginTrue.js'), external: true };
					if (source.endsWith('/pluginForceAbsolute.js'))
						return { id: '/pluginForceAbsolute.js', external: 'absolute' };
					if (source.endsWith('/pluginForceRelative.js'))
						return { id: path.join(__dirname, 'pluginForceRelative.js'), external: 'relative' };
				}
			}
		]
	}
});
