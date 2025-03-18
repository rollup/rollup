const assert = require('assert');
const util = require('util');
const path = require('path');

const idFilterHooks = ['resolveId', 'load'];
const hooks = [...idFilterHooks, 'transform'];

const calledHooks = {};
for (const hook of hooks) {
	calledHooks[hook] = {};
}

const s = {
	resolveId: {
		'./bar.js': [
			"resolveId-{ id: { include: '*.js' } }",
			'resolveId-{ id: { include: /\\.js$/ } }',
			"resolveId-{ id: { exclude: 'foo.js' } }",
			"resolveId-{ id: { include: '*.js', exclude: 'foo.*' } }"
		],
		'./baz.js': [
			"resolveId-{ id: { include: '*.js' } }",
			'resolveId-{ id: { include: /\\.js$/ } }',
			"resolveId-{ id: { exclude: 'foo.js' } }",
			"resolveId-{ id: { include: '*.js', exclude: 'foo.*' } }"
		],
		'./foo.js': [
			"resolveId-{ id: 'foo.js' }",
			"resolveId-{ id: [ 'foo.js' ] }",
			"resolveId-{ id: { include: '*.js' } }",
			'resolveId-{ id: { include: /\\.js$/ } }',
			"resolveId-{ id: { exclude: 'ba*.js' } }",
			'resolveId-{ id: { exclude: /ba.*\\.js$/ } }',
			'resolveId-{ id: { exclude: [ /ba.*\\.js$/ ] } }',
			"resolveId-{ id: { include: 'foo.js', exclude: 'bar.js' } }"
		]
	},
	load: {
		'bar.js': ["load-{ id: { exclude: 'foo.js' } }"],
		'baz.js': ["load-{ id: { exclude: 'foo.js' } }"],
		'foo.js': ["load-{ id: 'foo.js' }"]
	},
	transform: {
		'bar.js': [
			"transform-{ id: { exclude: 'foo.js' } }",
			"transform-{ code: { exclude: 'import.meta.a' } }",
			'transform-{ code: { exclude: /import\\.\\w+\\.a/ } }',
			'transform-{ code: { exclude: [ /import\\.\\w+\\.a/ ] } }',
			'transform-{ code: { include: /import\\.meta\\.\\w+/, exclude: /import\\.\\w+\\.a/ } }'
		],
		'baz.js': [
			"transform-{ id: { exclude: 'foo.js' } }",
			"transform-{ code: 'import.meta.a' }",
			"transform-{ code: [ 'import.meta.a' ] }",
			"transform-{ code: { include: 'import.meta.a' } }",
			'transform-{ code: { include: /import\\.\\w+\\.a/ } }',
			'transform-{ code: { include: [ /import\\.\\w+\\.a/ ] } }',
			"transform-{ code: { include: 'import.meta.a', exclude: 'import.meta.b' } }"
		],
		'foo.js': [
			"transform-{ id: 'foo.js' }",
			"transform-{ code: 'import.meta.a' }",
			"transform-{ code: [ 'import.meta.a' ] }",
			"transform-{ code: { include: 'import.meta.a' } }",
			'transform-{ code: { include: /import\\.\\w+\\.a/ } }',
			'transform-{ code: { include: [ /import\\.\\w+\\.a/ ] } }',
			"transform-{ code: { include: 'import.meta.a', exclude: 'import.meta.b' } }",
			"transform-{ id: { exclude: 'ba*.js' }, code: 'import.meta.a' }",
			"transform-{ id: { include: 'foo.js', exclude: 'ba*.js' }, code: 'import.meta.b' }"
		]
	}
};

const plugins = [];
addPlugin('resolveId', { id: 'foo.js' });
addPlugin('resolveId', { id: ['foo.js'] });
addPlugin('resolveId', { id: { include: '*.js' } });
addPlugin('resolveId', { id: { include: /\.js$/ } });
addPlugin('resolveId', { id: { exclude: 'foo.js' } });
addPlugin('resolveId', { id: { exclude: 'ba*.js' } });
addPlugin('resolveId', { id: { exclude: /ba.*\.js$/ } });
addPlugin('resolveId', { id: { exclude: [/ba.*\.js$/] } });
addPlugin('resolveId', { id: { include: 'foo.js', exclude: 'bar.js' } });
// exclude has higher priority so it does not match foo.js
addPlugin('resolveId', { id: { include: '*.js', exclude: 'foo.*' } });
addPlugin('load', { id: 'foo.js' });
addPlugin('load', { id: { exclude: 'foo.js' } });
addPlugin('transform', { id: 'foo.js' });
addPlugin('transform', { id: { exclude: 'foo.js' } });
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
addPlugin('transform', { id: { exclude: 'ba*.js' }, code: 'import.meta.a' });
addPlugin('transform', { id: { include: 'foo.js', exclude: 'ba*.js' }, code: 'import.meta.b' });

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
			assert.deepStrictEqual(calledHooks[hook], s[hook], hook);
		}
	},
	warnings: [
		{
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "main".',
			names: ['main']
		}
	],
	solo: true
};
