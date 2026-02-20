export type AstBuffer = Uint32Array & { convertString: ConvertString };
type ConvertString = (position: number) => string;

export type AstBufferForWriting<T = Uint8Array | Buffer> = Uint32Array & AstBufferForWritingApi<T>;

interface AstBufferForWritingApi<T = Uint8Array | Buffer> {
	addStringToBuffer: (text: string, referencePosition: number) => AstBufferForWriting<T>;
	byteBuffer: T;
	position: number;
	reserve: (size: number) => AstBufferForWriting<T>;
	toOutput: () => T;
}

export function getAstBuffer(byteBuffer: Buffer | Uint8Array): AstBuffer {
	const array = new Uint32Array(byteBuffer.buffer);
	let convertString: ConvertString;
	if (typeof Buffer !== 'undefined' && byteBuffer instanceof Buffer) {
		convertString = position => {
			const length = array[position];
			const bytePosition = (position + 1) << 2;
			return byteBuffer.toString('utf8', bytePosition, bytePosition + length);
		};
	} else {
		const textDecoder = new TextDecoder();
		convertString = position => {
			const length = array[position];
			const bytePosition = (position + 1) << 2;
			return textDecoder.decode(byteBuffer.subarray(bytePosition, bytePosition + length));
		};
	}
	return Object.assign(array, { convertString });
}

export function createAstBufferUint8(uInt32Size: number): AstBufferForWriting<Uint8Array> {
	const buffer = new Uint32Array(uInt32Size) as AstBufferForWriting<Uint8Array>;
	const encoder = new TextEncoder();
	return Object.assign(buffer, {
		addStringToBuffer(text, referencePosition) {
			const insertPosition = buffer.position;
			buffer[referencePosition] = insertPosition;
			const encoded = encoder.encode(text);
			const encodedByteLength = encoded.length;
			// Round up to the next 4-byte boundary, add 1 for the length
			const reservedSize = 1 + ((encodedByteLength + 3) >> 2);
			const extendedBuffer = buffer.reserve(reservedSize);
			extendedBuffer[insertPosition] = encodedByteLength;
			extendedBuffer.byteBuffer.set(encoded, (insertPosition + 1) << 2);
			return extendedBuffer;
		},
		byteBuffer: new Uint8Array(buffer.buffer),
		position: 0,
		reserve(size) {
			const newPosition = buffer.position + size;
			if (newPosition <= buffer.length) {
				buffer.position = newPosition;
				return buffer;
			}
			const newBuffer = createAstBufferUint8(newPosition * 2);
			newBuffer.set(buffer);
			newBuffer.position = newPosition;
			return newBuffer;
		},
		toOutput() {
			const byteSize = buffer.position << 2;
			return buffer.byteBuffer.slice(0, byteSize);
		}
	} satisfies AstBufferForWritingApi<Uint8Array>);
}

export function createAstBufferNode(uInt32Size: number): AstBufferForWriting<Buffer> {
	const buffer = new Uint32Array(uInt32Size) as AstBufferForWriting<Buffer>;
	return Object.assign(buffer, {
		addStringToBuffer(text, referencePosition) {
			let extendedBuffer = buffer;
			const requiredSize = buffer.position + 1 + ((text.length * 3 + 3) >> 2);
			if (requiredSize > buffer.length) {
				// Reserve more space if needed
				extendedBuffer = createAstBufferNode(requiredSize * 2);
				buffer.byteBuffer.copy(extendedBuffer.byteBuffer, 0, 0, buffer.position << 2);
				extendedBuffer.position = buffer.position;
			}
			const insertPosition = extendedBuffer.position;
			extendedBuffer[referencePosition] = insertPosition;
			const textBytePosition = (insertPosition + 1) << 2;
			const encodedLength = extendedBuffer.byteBuffer.write(text, textBytePosition);
			extendedBuffer[insertPosition] = encodedLength;
			// Round up to the next 4-byte boundary
			extendedBuffer.position = (textBytePosition + encodedLength + 3) >> 2;
			return extendedBuffer;
		},
		byteBuffer: Buffer.from(buffer.buffer),
		position: 0,
		reserve(size) {
			const newPosition = buffer.position + size;
			if (newPosition <= buffer.length) {
				buffer.position = newPosition;
				return buffer;
			}
			const newBuffer = createAstBufferNode(newPosition * 2);
			buffer.byteBuffer.copy(newBuffer.byteBuffer, 0, 0, buffer.position << 2);
			newBuffer.position = newPosition;
			return newBuffer;
		},
		toOutput() {
			const byteSize = buffer.position << 2;
			// The "slow" version will allocate exactly the needed size and is preferable
			// for long-term memory usage.
			const truncatedBuffer = Buffer.allocUnsafeSlow(byteSize);
			buffer.byteBuffer.copy(truncatedBuffer, 0, 0, byteSize);
			return truncatedBuffer;
		}
	} satisfies AstBufferForWritingApi<Buffer>);
}
