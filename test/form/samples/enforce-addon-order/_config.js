const assert = require('assert');
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const ID_MAIN = path.join(__dirname, 'main.js');
const code = fs.readFileSync(ID_MAIN, 'utf8');

const hooks = ['banner', 'footer', 'intro', 'outro'];

const plugins = [];
addPlugin(null);
addPlugin('pre');
addPlugin('post');
addPlugin('post');
addPlugin('pre');
addPlugin(undefined);
function addPlugin(order) {
	const name = `${order}-${(plugins.length >> 1) + 1}`;
	const plugin = { name };
	const stringPlugin = { name: `string-${name}` };
	for (const hook of hooks) {
		plugin[hook] = {
			order,
			handler: () => `// ${hook}-${name}`
		};
		stringPlugin[hook] = {
			order,
			handler: `// ${hook}-string-${name}`
		};
	}
	plugins.push(plugin, stringPlugin);
}

module.exports = {
	description: 'allows to enforce addon order',
	options: {
		plugins
	}
};
