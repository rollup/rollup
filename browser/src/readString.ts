const textDecoder = new TextDecoder();

export default function readString(astBuffer: Uint8Array, start: number, length: number) {
	return textDecoder.decode(astBuffer.subarray(start, start + length));
}
