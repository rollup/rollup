export type AstBuffer = Uint32Array & { convertString: ConvertString };
type ConvertString = (position: number) => string;

export type AstBufferForWriting = Uint32Array & {
	addStringToBuffer: AddStringToBuffer;
	position: number;
	byteBuffer: Uint8Array | Buffer;
};

type AddStringToBuffer = (text: string, referencePosition: number) => AstBufferForWriting;

export function getAstBuffer(astBuffer: Buffer | Uint8Array): AstBuffer {
	const array = new Uint32Array(astBuffer.buffer);
	let convertString: ConvertString;
	if (typeof Buffer !== 'undefined' && astBuffer instanceof Buffer) {
		convertString = position => {
			const length = array[position];
			const bytePosition = (position + 1) << 2;
			return astBuffer.toString('utf8', bytePosition, bytePosition + length);
		};
	} else {
		const textDecoder = new TextDecoder();
		convertString = position => {
			const length = array[position];
			const bytePosition = (position + 1) << 2;
			return textDecoder.decode(astBuffer.subarray(bytePosition, bytePosition + length));
		};
	}
	return Object.assign(array, { convertString });
}

export function createAstBuffer(uInt32Size: number): AstBufferForWriting {
	const buffer = new Uint32Array(uInt32Size) as AstBufferForWriting;
	let addStringToBuffer: AddStringToBuffer;
	if (typeof Buffer !== 'undefined') {
		const byteBuffer = (buffer.byteBuffer = Buffer.from(buffer.buffer));
		addStringToBuffer = (text, referencePosition) => {
			const insertPosition = buffer.position;
			buffer[referencePosition] = insertPosition;
			const textBytePosition = (insertPosition + 1) << 2;
			const encodedLength = byteBuffer.write(text, textBytePosition);
			buffer[insertPosition] = encodedLength;
			// Round up to the next 4-byte boundary
			buffer.position = (textBytePosition + encodedLength + 3) >> 2;
			return buffer;
		};
	} else {
		const encoder = new TextEncoder();
		const byteBuffer = (buffer.byteBuffer = new Uint8Array(buffer.buffer));
		addStringToBuffer = (text, referencePosition) => {
			const insertPosition = buffer.position;
			buffer[referencePosition] = insertPosition;
			const textBytePosition = (insertPosition + 1) << 2;
			const encoded = encoder.encode(text);
			const encodedLength = encoded.length;
			byteBuffer.set(encoded, textBytePosition);
			buffer[insertPosition] = encodedLength;
			// Round up to the next 4-byte boundary
			buffer.position = (textBytePosition + encodedLength + 3) >> 2;
			return buffer;
		};
	}
	return Object.assign(buffer, { addStringToBuffer });
}
