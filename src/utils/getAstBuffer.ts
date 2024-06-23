export type AstBuffer = Uint32Array & { convertString: (position: number) => string };

export function getAstBuffer(astBuffer: Buffer | Uint8Array): AstBuffer {
	const array = new Uint32Array(astBuffer.buffer);
	let convertString: (position: number) => string;
	if (typeof Buffer !== 'undefined' && astBuffer instanceof Buffer) {
		convertString = (position: number) => {
			const length = array[position++];
			const bytePosition = position << 2;
			return astBuffer.toString('utf8', bytePosition, bytePosition + length);
		};
	} else {
		const textDecoder = new TextDecoder();
		convertString = (position: number) => {
			const length = array[position++];
			const bytePosition = position << 2;
			return textDecoder.decode(astBuffer.subarray(bytePosition, bytePosition + length));
		};
	}
	return Object.assign(array, { convertString });
}
