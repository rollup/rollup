import sha256 from 'hash.js/lib/hash/sha/256';

export const createHash = (): {
	digest: (format: string) => string;
	update: (data: unknown) => void;
} => sha256();
