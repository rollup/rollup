import { stat } from './fs';
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

export function cacheLoadHook(cache: HookCache, plugin: Plugin) {
	return function cachedLoad(id: string) {
		// An inherently side-effectful part of `.load` is the filesystem.
		// We want to invalidate the cache if the file has changed.
		// A good cheap metric for this is mtime and size. We combine these into the
		// cache key so that files with different mtime/size invalidate the cache
		return stat(id)
			.then(({ mtimeMs, size }) => [mtimeMs, size], () => [0, 0])
			.then(([mtimeMs, size]) => {
				const key = `load|${plugin.name || '(anonymous plugin)'}|${
					plugin.cacheKey
				}|${id}|${mtimeMs}|${size}`;
				return key in cache
					? Promise.resolve(cache[key])
					: Promise.resolve()
							.then(() => plugin.load.call(this, id))
							.then(value => (cache[key] = value));
			});
	};
}

export function cacheTransformHook(cache: HookCache, plugin: Plugin) {
	return function cachedTransform(code: string, id: string) {
		const key = `transform|${plugin.name || '(anonymous plugin)'}|${plugin.cacheKey}|${id}|${code}`;
		return key in cache
			? Promise.resolve(cache[key])
			: Promise.resolve()
					.then(() => plugin.transform.call(this, code, id))
					.then(value => (cache[key] = value));
	};
}
