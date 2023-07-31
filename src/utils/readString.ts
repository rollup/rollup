export default function readString(astBuffer: Buffer, start: number, length: number) {
	return astBuffer.toString('utf8', start, start + length);
}
