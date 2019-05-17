import sha256 from 'hash.js/lib/hash/sha/256';

export function addWithNewReferenceId<T>(item: T, idMap: Map<string, T>, hashBase: string): string {
	let referenceId: string | undefined;
	do {
		const hash = sha256();
		if (referenceId) {
			hash.update(referenceId);
		} else {
			hash.update(hashBase);
		}
		referenceId = hash.digest('hex').substr(0, 8);
	} while (idMap.has(referenceId));
	idMap.set(referenceId, item);
	return referenceId;
}
