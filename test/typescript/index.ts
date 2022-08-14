// eslint-disable-next-line import/no-unresolved
import * as rollup from './dist/rollup';

// Plugin API
interface Options {
	extensions?: string | string[];
}

const plugin: rollup.PluginImpl<Options> = (options = {}) => {
	const extensions = options.extensions || ['.js'];
	return {
		name: 'my-plugin',
		resolveId: {
			handler(source, importer, options) {
				// @ts-expect-error source is typed as string
				const s: number = source;
			}
		}
	};
};

plugin();
plugin({ extensions: ['.js', 'json'] });

const pluginHooks: rollup.Plugin = {
	buildStart: {
		handler() {},
		sequential: true
	},
	async load(id) {
		// @ts-expect-error id is typed as string
		const i: number = id;
		await this.resolve('rollup');
	},
	name: 'test',
	resolveId: {
		async handler(source, importer, options) {
			await this.resolve('rollup');
			// @ts-expect-error source is typed as string
			const s: number = source;
		},
		// @ts-expect-error sequential is only supported for parallel hooks
		sequential: true
	}
};

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
