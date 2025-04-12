const { getInfoWithUsed } = await import('./lib-used.js');

export function getInfoWithVariant() {
	return getInfoWithUsed() + '_variant';
}
