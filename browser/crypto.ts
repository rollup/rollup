import * as asmCrypto from 'asmcrypto.js';

function createHash(algorithm: string) {
	return new Hasher(algorithm);
}

class Hasher {
	hasher: asmCrypto.Sha256;

	constructor(algorithm: string) {
		switch (algorithm) {
			case 'sha256':
				this.hasher = new asmCrypto.Sha256();
				break;
			default:
				throw new Error(`Unsupported algorithm: '${algorithm}'.`);
		}
	}

	digest(encoding: string) {
		this.hasher.finish();
		// The type of '.result' is always 'Uint8Array' after calling 'finish()'. Before that, it could also be 'null'. Casting
		// is necessary to avoid type errors when encoding the hash.
		const hash = this.hasher.result as Uint8Array;

		let encoded: string;
		switch (encoding) {
			case 'hex':
				encoded = asmCrypto.bytes_to_hex(hash);
				break;
			default:
				throw new Error(`Unsupported encoding: '${encoding}'.`);
		}

		return encoded;
	}

	update(data: string | Buffer) {
		if (typeof data === 'string') {
			this.hasher.process(new Uint8Array(data.length).map((_, i) => data.charCodeAt(i)));
		} else {
			this.hasher.process(data);
		}

		return this;
	}
}

export { createHash };
