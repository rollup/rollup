import type { UniqueModuleId } from '../rollup/types';

export function getRawIdAndAttributes(id: string): {
	rawId: string;
	attributes?: Record<string, string>;
} {
	const [rawId, attributesString] = id.split('?');
	return {
		attributes: attributesString
			? Object.fromEntries(new URLSearchParams(attributesString))
			: undefined,
		rawId
	};
}

export function generateIdByRawIdAndAttributes(
	rawId: string,
	attributes?: Record<string, string>
): string {
	const attributesString = new URLSearchParams(attributes).toString();
	if (!attributesString) {
		return rawId;
	}
	return `${rawId}?${attributesString}`;
}

export function normalizeModuleId(moduleId: UniqueModuleId): string {
	if (typeof moduleId === 'object') {
		return generateIdByRawIdAndAttributes(moduleId.rawId, moduleId.attributes);
	}
	return moduleId;
}
