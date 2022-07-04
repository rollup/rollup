import type { RollupError } from '../rollup/types';
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
