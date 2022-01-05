import { NormalizedInputOptions, Plugin, RollupError } from '../rollup/types';
import { error, Errors, warnDeprecation } from './error';

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
	{ active: true, deprecated: 'resolveAssetUrl', replacement: 'resolveFileUrl' }
];

export function warnDeprecatedHooks(
	plugins: readonly Plugin[],
	options: NormalizedInputOptions
): void {
	for (const { active, deprecated, replacement } of deprecatedHooks) {
		for (const plugin of plugins) {
			if (deprecated in plugin) {
				warnDeprecation(
					{
						message: `The "${deprecated}" hook used by plugin ${plugin.name} is deprecated. The "${replacement}" hook should be used instead.`,
						plugin: plugin.name
					},
					active,
					options
				);
			}
		}
	}
}
