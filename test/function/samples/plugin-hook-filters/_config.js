const assert = require('assert');
const util = require('util');
const path = require('path');

const idFilterHooks = ['resolveId', 'load'];
const hooks = [...idFilterHooks, 'transform'];

const calledHooks = {};
for (const hook of hooks) {
	calledHooks[hook] = {};
}

const expectedCalledHooks = {
	resolveId: {
		'./bar.js': ['resolveId-{}', 'resolveId-{ id: { exclude: /foo\\.js$/ } }'],
		'./baz.js': ['resolveId-{}', 'resolveId-{ id: { exclude: /foo\\.js$/ } }'],
		'./foo.js': ['resolveId-{}', 'resolveId-{ id: /foo\\.js$/ }']
	},
	load: {
		'bar.js': [
			'load-{}',
			'load-{ id: {} }',
			"load-{ id: { include: '**/*.js' } }",
			'load-{ id: { include: /\\.js$/ } }',
			"load-{ id: { exclude: '**/foo.js' } }",
			"load-{ id: { include: '**/*.js', exclude: '**/foo.*' } }"
		],
		'baz.js': [
			'load-{}',
			'load-{ id: {} }',
			"load-{ id: { include: '**/*.js' } }",
			'load-{ id: { include: /\\.js$/ } }',
			"load-{ id: { exclude: '**/foo.js' } }",
			"load-{ id: { include: '**/*.js', exclude: '**/foo.*' } }"
		],
		'foo.js': [
			'load-{}',
			'load-{ id: {} }',
			"load-{ id: 'foo.js' }",
			"load-{ id: '**/foo.js' }",
			"load-{ id: [ '**/foo.js' ] }",
			"load-{ id: { include: '**/*.js' } }",
			'load-{ id: { include: /\\.js$/ } }',
			"load-{ id: { exclude: '**/ba*.js' } }",
			'load-{ id: { exclude: /ba.*\\.js$/ } }',
			'load-{ id: { exclude: [ /ba.*\\.js$/ ] } }',
			"load-{ id: { include: '**/foo.js', exclude: '**/bar.js' } }"
		]
	},
	transform: {
		'bar.js': [
			'transform-{}',
			"transform-{ id: { exclude: '**/foo.js' } }",
			"transform-{ code: { exclude: 'import.meta.a' } }",
			'transform-{ code: { exclude: /import\\.\\w+\\.a/ } }',
			'transform-{ code: { exclude: [ /import\\.\\w+\\.a/ ] } }',
			'transform-{ code: { include: /import\\.meta\\.\\w+/, exclude: /import\\.\\w+\\.a/ } }'
		],
		'baz.js': [
			'transform-{}',
			"transform-{ id: { exclude: '**/foo.js' } }",
			"transform-{ code: 'import.meta.a' }",
			"transform-{ code: [ 'import.meta.a' ] }",
			"transform-{ code: { include: 'import.meta.a' } }",
			'transform-{ code: { include: /import\\.\\w+\\.a/ } }',
			'transform-{ code: { include: [ /import\\.\\w+\\.a/ ] } }',
			"transform-{ code: { include: 'import.meta.a', exclude: 'import.meta.b' } }"
		],
		'foo.js': [
			'transform-{}',
			"transform-{ id: '**/foo.js' }",
			"transform-{ code: 'import.meta.a' }",
			"transform-{ code: [ 'import.meta.a' ] }",
			"transform-{ code: { include: 'import.meta.a' } }",
			'transform-{ code: { include: /import\\.\\w+\\.a/ } }',
			'transform-{ code: { include: [ /import\\.\\w+\\.a/ ] } }',
			"transform-{ code: { include: 'import.meta.a', exclude: 'import.meta.b' } }",
			"transform-{ id: { exclude: '**/ba*.js' }, code: 'import.meta.a' }",
			"transform-{\n  id: { include: '**/foo.js', exclude: '**/ba*.js' },\n  code: 'import.meta.a'\n}"
		]
	}
};

const plugins = [];
addPlugin('resolveId', {});
addPlugin('resolveId', { id: /foo\.js$/ });
addPlugin('resolveId', { id: { exclude: /foo\.js$/ } });
addPlugin('load', {});
addPlugin('load', { id: {} });
addPlugin('load', { id: 'foo.js' });
addPlugin('load', { id: '**/foo.js' });
addPlugin('load', { id: ['**/foo.js'] });
addPlugin('load', { id: { include: '**/*.js' } });
addPlugin('load', { id: { include: /\.js$/ } });
addPlugin('load', { id: { exclude: '**/foo.js' } });
addPlugin('load', { id: { exclude: '**/ba*.js' } });
addPlugin('load', { id: { exclude: /ba.*\.js$/ } });
addPlugin('load', { id: { exclude: [/ba.*\.js$/] } });
addPlugin('load', { id: { include: '**/foo.js', exclude: '**/bar.js' } });
// exclude has higher priority so it does not match foo.js
addPlugin('load', { id: { include: '**/*.js', exclude: '**/foo.*' } });
addPlugin('transform', {});
addPlugin('transform', { id: '**/foo.js' });
addPlugin('transform', { id: { exclude: '**/foo.js' } });
addPlugin('transform', { code: 'import.meta.a' });
addPlugin('transform', { code: ['import.meta.a'] });
addPlugin('transform', { code: { include: 'import.meta.a' } });
addPlugin('transform', { code: { include: /import\.\w+\.a/ } });
addPlugin('transform', { code: { include: [/import\.\w+\.a/] } });
addPlugin('transform', { code: { exclude: 'import.meta.a' } });
addPlugin('transform', { code: { exclude: /import\.\w+\.a/ } });
addPlugin('transform', { code: { exclude: [/import\.\w+\.a/] } });
addPlugin('transform', { code: { include: 'import.meta.a', exclude: 'import.meta.b' } });
// exclude has higher priority so it does not match import.meta.a
addPlugin('transform', { code: { include: /import\.meta\.\w+/, exclude: /import\.\w+\.a/ } });
addPlugin('transform', { id: { exclude: '**/ba*.js' }, code: 'import.meta.a' });
addPlugin('transform', {
	id: { include: '**/foo.js', exclude: '**/ba*.js' },
	code: 'import.meta.a'
});

function addPlugin(hook, filter) {
	const name = `${hook}-${util.inspect(filter)}`;
	const plugin = {
		name,
		[hook]: {
			filter,
			handler(idOrCodeArgument, idArgument) {
				let id = hook === 'transform' ? idArgument : idOrCodeArgument;
				if (id.includes('main.js')) {
					return;
				}
				id = path.isAbsolute(id) ? path.relative(__dirname, id) : id;

				calledHooks[hook][id] ??= [];
				if (!calledHooks[hook][id].includes(name)) {
					calledHooks[hook][id].push(name);
				}
			}
		}
	};
	plugins.push(plugin);
}

module.exports = {
	description: 'plugin hook filter is supported',
	options: {
		plugins
	},
	exports() {
		for (const hook of hooks) {
			assert.deepStrictEqual(calledHooks[hook], expectedCalledHooks[hook], hook);
		}
	},
	warnings: [
		{
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "main".',
			names: ['main']
		}
	]
};
