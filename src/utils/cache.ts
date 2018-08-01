import { HookCache, Plugin } from './rollup/types';

export function cacheResolveIdHook(cache: HookCache, plugin: Plugin) {
	return function cachedResolveId(id: string) {
		const key = `resolve|${plugin.name || '(anonymous plugin)'}|${plugin.cacheKey}|${id}`;
		return key in cache
			? Promise.resolve(cache[key])
			: Promise.resolve()
					.then(() => plugin.resolveId.call(this, id))
					.then(value => (cache[key] = value));
	};
}
