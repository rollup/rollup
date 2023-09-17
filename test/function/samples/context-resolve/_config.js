const assert = require('node:assert');
const path = require('node:path');

const tests = [
	{
		source: './existing',
		expected: {
			id: path.join(__dirname, 'existing.js'),
			attributes: {},
			external: false,
			meta: {},
			resolvedBy: 'rollup',
			moduleSideEffects: true,
			syntheticNamedExports: false
		}
	},
	{
		source: './missing-relative',
		expected: null
	},
	{
		source: 'missing-absolute',
		expected: null
	},
	{
		source: './marked-directly-external-relative',
		expected: {
			id: path.join(__dirname, 'marked-directly-external-relative'),
			attributes: {},
			external: true,
			meta: {},
			moduleSideEffects: true,
			resolvedBy: 'rollup',
			syntheticNamedExports: false
		}
	},
	{
		source: './marked-external-relative',
		expected: {
			id: path.join(__dirname, 'marked-external-relative'),
			attributes: {},
			external: true,
			meta: {},
			moduleSideEffects: true,
			resolvedBy: 'rollup',
			syntheticNamedExports: false
		}
	},
	{
		source: 'marked-external-absolute',
		expected: {
			id: 'marked-external-absolute',
			attributes: {},
			external: true,
			meta: {},
			moduleSideEffects: true,
			resolvedBy: 'rollup',
			syntheticNamedExports: false
		}
	},
	{
		source: 'resolved-name',
		expected: {
			id: 'resolved:resolved-name',
			attributes: {},
			external: false,
			meta: {},
			moduleSideEffects: true,
			resolvedBy: 'at position 2',
			syntheticNamedExports: false
		}
	},
	{
		source: 'resolved-false',
		expected: {
			id: 'resolved-false',
			attributes: {},
			external: true,
			meta: {},
			resolvedBy: 'rollup',
			moduleSideEffects: true,
			syntheticNamedExports: false
		}
	},
	{
		source: 'resolved-object',
		expected: {
			id: 'resolved:resolved-object',
			attributes: {},
			external: false,
			meta: {},
			moduleSideEffects: true,
			resolvedBy: 'at position 2',
			syntheticNamedExports: false
		}
	},
	{
		source: 'resolved-object-non-external',
		expected: {
			id: 'resolved:resolved-object-non-external',
			attributes: {},
			external: false,
			meta: {},
			moduleSideEffects: true,
			resolvedBy: 'at position 2',
			syntheticNamedExports: false
		}
	},
	{
		source: 'resolved-object-external',
		expected: {
			id: 'resolved:resolved-object-external',
			attributes: {},
			external: true,
			meta: {},
			moduleSideEffects: true,
			resolvedBy: 'at position 2',
			syntheticNamedExports: false
		}
	}
];

module.exports = defineTest({
	description: 'returns the correct results for the context resolve helper',
	options: {
		external: [
			'marked-external-absolute',
			'./marked-directly-external-relative',
			path.join(__dirname, 'marked-external-relative')
		],
		plugins: [
			{
				resolveId(id) {
					if (id === 'resolutions') {
						return id;
					}
				},
				load(id) {
					if (id === 'resolutions') {
						return Promise.all(
							tests.map(({ source, expected }) =>
								this.resolve(source, path.join(__dirname, 'main.js')).then(resolution =>
									assert.deepStrictEqual(resolution, expected)
								)
							)
						).then(result => `export default ${result.length}`);
					}
				}
			},
			{
				resolveId(id) {
					switch (id) {
						case 'resolved-name': {
							return 'resolved:resolved-name';
						}
						case 'resolved-false': {
							return false;
						}
						case 'resolved-object': {
							return { id: 'resolved:resolved-object' };
						}
						case 'resolved-object-non-external': {
							return { id: 'resolved:resolved-object-non-external', external: false };
						}
						case 'resolved-object-external': {
							return { id: 'resolved:resolved-object-external', external: true };
						}
					}
				}
			}
		]
	}
});
