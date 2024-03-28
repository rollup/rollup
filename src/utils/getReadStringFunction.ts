export type ReadString = (start: number, length: number) => string;

export default function getReadStringFunction(astBuffer: Buffer | Uint8Array): ReadString {
	if (typeof Buffer !== 'undefined' && astBuffer instanceof Buffer) {
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
