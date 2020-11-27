import * as rollup from './dist/rollup';

// Plugin API
interface Options {
	extensions?: string | string[];
}
const plugin: rollup.PluginImpl<Options> = (options = {}) => {
	// tslint:disable-next-line:no-unused-variable
	const extensions = options.extensions || ['.js'];
	return { name: 'my-plugin' };
};

plugin();
plugin({ extensions: ['.js', 'json'] });

const amdOutputOptions: rollup.OutputOptions['amd'][] = [
	{},
	{
		id: 'a'
	},
	{
		autoId: false,
		basePath: '',
		id: 'a'
	},
	{
		autoId: true,
		basePath: 'a'
	},
	{
		autoId: true
	},
	{
		autoId: true,
		// @ts-expect-error
		id: 'a'
	},
	{
		basePath: 'a',
		// @ts-expect-error
		id: 'a'
	}
];
