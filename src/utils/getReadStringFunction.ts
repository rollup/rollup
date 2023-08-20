export default function getReadStringFunction(
	astBuffer: Buffer | Uint8Array
): (start: number, length: number) => string {
	let bufferConstructor = null;
	try {
		bufferConstructor = Buffer;
	} catch {
		/* regardless of error */
	}
	if (bufferConstructor && astBuffer instanceof bufferConstructor) {
		return function readString(start, length) {
			return astBuffer.toString('utf8', start, start + length);
		};
	} else {
		const textDecoder = new TextDecoder();
		return function readString(start, length) {
			return textDecoder.decode(astBuffer.subarray(start, start + length));
		};
	}
}
