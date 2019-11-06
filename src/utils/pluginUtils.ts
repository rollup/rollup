import Graph from '../Graph';
import { Plugin, RollupError } from '../rollup/types';
import { error, Errors } from './error';

export const ANONYMOUS_PLUGIN_PREFIX = 'at position ';
export const ANONYMOUS_OUTPUT_PLUGIN_PREFIX = 'at output position ';

export function throwPluginError(
	err: string | RollupError,
	plugin: string,
	{ hook, id }: { hook?: string; id?: string } = {}
): never {
	if (typeof err === 'string') err = { message: err };
	if (err.code && err.code !== Errors.PLUGIN_ERROR) {
		err.pluginCode = err.code;
	}
	err.code = Errors.PLUGIN_ERROR;
	err.plugin = plugin;
	if (hook) {
		err.hook = hook;
	}
	if (id) {
		err.id = id;
	}
	return error(err);
}

export const deprecatedHooks: { active: boolean; deprecated: string; replacement: string }[] = [
	{ active: true, deprecated: 'ongenerate', replacement: 'generateBundle' },
	{ active: true, deprecated: 'onwrite', replacement: 'generateBundle/writeBundle' },
	{ active: true, deprecated: 'transformBundle', replacement: 'renderChunk' },
	{ active: true, deprecated: 'transformChunk', replacement: 'renderChunk' },
	{ active: false, deprecated: 'resolveAssetUrl', replacement: 'resolveFileUrl' }
];

export function warnDeprecatedHooks(plugins: Plugin[], graph: Graph) {
	for (const { active, deprecated, replacement } of deprecatedHooks) {
		for (const plugin of plugins) {
			if (deprecated in plugin) {
				graph.warnDeprecation(
					{
						message: `The "${deprecated}" hook used by plugin ${plugin.name} is deprecated. The "${replacement}" hook should be used instead.`,
						plugin: plugin.name
					},
					active
				);
			}
		}
	}
}
