import type { UniqueModuleId } from '../rollup/types';

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

export function normalizeModuleIdToObject(
	moduleId: string | { rawId: string; attributes?: Record<string, string> }
): {
	id: string;
	rawId: string;
	attributes?: Record<string, string>;
} {
	if (typeof moduleId === 'object') {
		return {
			...moduleId,
			id: generateIdByRawIdAndAttributes(moduleId.rawId, moduleId.attributes)
		};
	}
	const { rawId, attributes } = getRawIdAndAttributes(moduleId);
	return { attributes, id: moduleId, rawId };
}

function getRawIdAndAttributes(id: string): {
	rawId: string;
	attributes?: Record<string, string>;
} {
	const lastQuestionMarkIndex = id.lastIndexOf('?');
	if (lastQuestionMarkIndex === -1) {
		return { rawId: id };
	}
	const attributesAtStart = id.startsWith('attributes=', lastQuestionMarkIndex + 1);
	const attributesMarker = '&attributes=';
	const attributesMarkerIndex = attributesAtStart
		? lastQuestionMarkIndex
		: id.indexOf(attributesMarker, lastQuestionMarkIndex + 1);
	if (attributesMarkerIndex === -1) {
		return { rawId: id };
	}
	const attributesValueStart =
		attributesMarkerIndex + (attributesAtStart ? '?attributes='.length : attributesMarker.length);
	const attributesString = decodeURIComponent(id.slice(attributesValueStart));
	return {
		attributes: attributesString ? JSON.parse(attributesString) : undefined,
		rawId: id.slice(0, attributesMarkerIndex)
	};
}
