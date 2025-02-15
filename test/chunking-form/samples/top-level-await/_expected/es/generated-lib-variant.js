const { getInfoWithUsed } = await import('./generated-lib-used.js');

function getInfoWithVariant() {
	return getInfoWithUsed() + '_variant';
}

export { getInfoWithVariant };
