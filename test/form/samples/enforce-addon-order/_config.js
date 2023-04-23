const hooks = ['banner', 'footer', 'intro', 'outro'];

const plugins = [];
addPlugin(null);
addPlugin('pre');
addPlugin('post');
addPlugin('post');
addPlugin('pre');
addPlugin();
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

module.exports = defineTest({
	description: 'allows to enforce addon order',
	options: {
		plugins
	}
});
