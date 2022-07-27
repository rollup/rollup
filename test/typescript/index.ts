// eslint-disable-next-line import/no-unresolved
import * as rollup from './dist/rollup';

// Plugin API
interface Options {
	extensions?: string | string[];
}
const plugin: rollup.PluginImpl<Options> = (options = {}) => {
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
		autoId: false
	},
	{
		// @ts-expect-error for "basePath", "autoId" needs to be true
		autoId: false,
		basePath: '',
		// @ts-expect-error cannot combine "id" and "basePath"
		id: 'a'
	},
	{
		// @ts-expect-error cannot combine "id" and "autoId"
		autoId: true,
		// @ts-expect-error cannot combine "id" and "autoId"
		id: 'a'
	},
	{
		basePath: '',
		// @ts-expect-error cannot combine "id" and "basePath"
		id: 'a'
	},
	// @ts-expect-error needs "autoId" for "basePath"
	{
		basePath: ''
	}
];
