import type { PluginCache, SerializablePluginCache } from '../rollup/types';
import { error, logAnonymousPluginCache, logDuplicatePluginName } from './logs';
import { ANONYMOUS_OUTPUT_PLUGIN_PREFIX, ANONYMOUS_PLUGIN_PREFIX } from './pluginNames';

export function createPluginCache(cache: SerializablePluginCache): PluginCache {
	return {
		delete(id: string) {
			return delete cache[id];
		},
		get(id: string) {
			const item = cache[id];
			if (!item) return;
			item[0] = 0;
			return item[1];
		},
		has(id: string) {
			const item = cache[id];
			if (!item) return false;
			item[0] = 0;
			return true;
		},
		set(id: string, value: any) {
			cache[id] = [0, value];
		}
	};
}

export function getTrackedPluginCache(pluginCache: PluginCache, onUse: () => void): PluginCache {
	return {
		delete(id: string) {
			onUse();
			return pluginCache.delete(id);
		},
		get(id: string) {
			onUse();
			return pluginCache.get(id);
		},
		has(id: string) {
			onUse();
			return pluginCache.has(id);
		},
		set(id: string, value: any) {
			onUse();
			return pluginCache.set(id, value);
		}
	};
}

export const NO_CACHE: PluginCache = {
	delete() {
		return false;
	},
	get() {
		return undefined as any;
	},
	has() {
		return false;
	},
	set() {}
};

function uncacheablePluginError(pluginName: string): never {
	if (
		pluginName.startsWith(ANONYMOUS_PLUGIN_PREFIX) ||
		pluginName.startsWith(ANONYMOUS_OUTPUT_PLUGIN_PREFIX)
	) {
		return error(logAnonymousPluginCache());
	}
	return error(logDuplicatePluginName(pluginName));
}

export function getCacheForUncacheablePlugin(pluginName: string): PluginCache {
	return {
		delete() {
			return uncacheablePluginError(pluginName);
		},
		get() {
			return uncacheablePluginError(pluginName);
		},
		has() {
			return uncacheablePluginError(pluginName);
		},
		set() {
			return uncacheablePluginError(pluginName);
		}
	};
}
