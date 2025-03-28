import picomatch from 'picomatch';
import type { StringFilter, StringOrRegExp } from '../rollup/types';
import { ensureArray } from './ensureArray';
import { isAbsolute, normalize, resolve } from './path';

const FALLBACK_TRUE = 1;
const FALLBACK_FALSE = 0;
type FallbackValues = typeof FALLBACK_TRUE | typeof FALLBACK_FALSE;

type PluginFilterWithFallback = (input: string) => boolean | FallbackValues;

export type PluginFilter = (input: string) => boolean;
export type TransformHookFilter = (id: string, code: string) => boolean;

interface NormalizedStringFilter {
	include?: StringOrRegExp[];
	exclude?: StringOrRegExp[];
}

function getMatcherString(glob: string, cwd: string) {
	if (glob.startsWith('**') || isAbsolute(glob)) {
		return normalize(glob);
	}

	const resolved = resolve(cwd, glob);
	return normalize(resolved);
}

function patternToIdFilter(pattern: StringOrRegExp): PluginFilter {
	if (pattern instanceof RegExp) {
		return (id: string) => {
			const normalizedId = normalize(id);
			const result = pattern.test(normalizedId);
			pattern.lastIndex = 0;
			return result;
		};
	}
	const cwd = process.cwd();
	const glob = getMatcherString(pattern, cwd);
	const matcher = picomatch(glob, { dot: true });
	return (id: string) => {
		const normalizedId = normalize(id);
		return matcher(normalizedId);
	};
}

function patternToCodeFilter(pattern: StringOrRegExp): PluginFilter {
	if (pattern instanceof RegExp) {
		return (code: string) => {
			const result = pattern.test(code);
			pattern.lastIndex = 0;
			return result;
		};
	}
	return (code: string) => code.includes(pattern);
}

function createFilter(
	exclude: PluginFilter[] | undefined,
	include: PluginFilter[] | undefined
): PluginFilterWithFallback | undefined {
	if (!exclude && !include) {
		return;
	}

	return input => {
		if (exclude?.some(filter => filter(input))) {
			return false;
		}
		if (include?.some(filter => filter(input))) {
			return true;
		}
		return !!include && include.length > 0 ? FALLBACK_FALSE : FALLBACK_TRUE;
	};
}

function normalizeFilter(filter: StringFilter): NormalizedStringFilter {
	if (typeof filter === 'string' || filter instanceof RegExp) {
		return {
			include: [filter]
		};
	}
	if (Array.isArray(filter)) {
		return {
			include: ensureArray(filter)
		};
	}
	return {
		exclude: filter.exclude ? ensureArray(filter.exclude) : undefined,
		include: filter.include ? ensureArray(filter.include) : undefined
	};
}

function createIdFilter(filter: StringFilter | undefined): PluginFilterWithFallback | undefined {
	if (!filter) return;
	const { exclude, include } = normalizeFilter(filter);
	const excludeFilter = exclude?.map(patternToIdFilter);
	const includeFilter = include?.map(patternToIdFilter);
	return createFilter(excludeFilter, includeFilter);
}

function createCodeFilter(filter: StringFilter | undefined): PluginFilterWithFallback | undefined {
	if (!filter) return;
	const { exclude, include } = normalizeFilter(filter);
	const excludeFilter = exclude?.map(patternToCodeFilter);
	const includeFilter = include?.map(patternToCodeFilter);
	return createFilter(excludeFilter, includeFilter);
}

export function createFilterForId(filter: StringFilter | undefined): PluginFilter | undefined {
	const filterFunction = createIdFilter(filter);
	return filterFunction ? id => !!filterFunction(id) : undefined;
}

export function createFilterForTransform(
	idFilter: StringFilter | undefined,
	codeFilter: StringFilter | undefined
): TransformHookFilter | undefined {
	if (!idFilter && !codeFilter) return;
	const idFilterFunction = createIdFilter(idFilter);
	const codeFilterFunction = createCodeFilter(codeFilter);
	return (id, code) => {
		let fallback = true;
		if (idFilterFunction) {
			const idResult = idFilterFunction(id);
			if (typeof idResult === 'boolean') {
				return idResult;
			}
			fallback &&= !!idResult;
		}
		if (codeFilterFunction) {
			const codeResult = codeFilterFunction(code);
			if (typeof codeResult === 'boolean') {
				return codeResult;
			}
			fallback &&= !!codeResult;
		}
		return fallback;
	};
}
