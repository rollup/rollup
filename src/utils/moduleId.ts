import type { UniqueModuleId } from '../rollup/types';

export interface NormalizedModuleId {
	id: string;
	rawId: string;
	attributes?: Record<string, string>;
}

const ATTRIBUTES_MARKER_LENGTH = '&attributes='.length;

export function generateIdByRawIdAndAttributes(
	rawId: string,
	attributes?: Record<string, string>
): string {
	if (!attributes || Object.keys(attributes).length === 0) {
		return rawId;
	}
	const sortedAttributes = Object.fromEntries(
		Object.entries(attributes).sort(([firstKey], [secondKey]) =>
			firstKey < secondKey ? -1 : firstKey > secondKey ? 1 : 0
		)
	);
	return `${rawId}${rawId.includes('?') ? '&' : '?'}attributes=${encodeURIComponent(
		JSON.stringify(sortedAttributes)
	)}`;
}

export function normalizeModuleId(moduleId: UniqueModuleId): string {
	if (typeof moduleId === 'object') {
		return generateIdByRawIdAndAttributes(moduleId.rawId, moduleId.attributes);
	}
	return moduleId;
}

export function normalizeModuleIdToObject(moduleId: UniqueModuleId): NormalizedModuleId {
	if (typeof moduleId === 'object') {
		return {
			...moduleId,
			id: generateIdByRawIdAndAttributes(moduleId.rawId, moduleId.attributes)
		};
	}
	const { rawId, attributes } = getRawIdAndAttributes(moduleId);
	return { attributes, id: moduleId, rawId };
}

function getRawIdAndAttributes(id: string): Omit<NormalizedModuleId, 'id'> {
	const attributesMarkerIndex = Math.max(
		id.lastIndexOf('?attributes='),
		id.lastIndexOf('&attributes=')
	);
	if (attributesMarkerIndex === -1) {
		return { rawId: id };
	}
	try {
		const rawId = id.slice(0, attributesMarkerIndex);
		const attributes = JSON.parse(
			decodeURIComponent(id.slice(attributesMarkerIndex + ATTRIBUTES_MARKER_LENGTH))
		);
		if (generateIdByRawIdAndAttributes(rawId, attributes) === id) {
			return { attributes, rawId };
		}
	} catch {
		// fall through to treat the id as opaque
	}
	return { rawId: id };
}
