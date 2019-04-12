import sha256 from 'hash.js/lib/hash/sha/256';

export function addWithNewMetaId<T>(item: T, idMap: Map<string, T>, hashBase: string): string {
	let metaId: string;
	do {
		const hash = sha256();
		if (metaId) {
			hash.update(metaId);
		} else {
			hash.update(hashBase);
		}
		metaId = hash.digest('hex').substr(0, 8);
	} while (idMap.has(metaId));
	idMap.set(metaId, item);
	return metaId;
}
