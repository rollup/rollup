import sha256 from 'hash.js/lib/hash/sha/256';

function createHash(algorithm: string) {
	switch (algorithm) {
		case 'sha256':
			return sha256();
		default:
			throw new Error(`Unsupported algorithm: '${algorithm}'.`);
	}
}

export { createHash };
