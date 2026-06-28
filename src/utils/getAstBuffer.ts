export type AstBuffer = Uint32Array & {
	convertFloat64: (this: AstBuffer, position: number) => number;
	convertString: (position: number) => string;
};

export type AstBufferForWriting<T = Uint8Array | Buffer> = Uint32Array & AstBufferForWritingApi<T>;

interface AstBufferForWritingApi<T = Uint8Array | Buffer> {
	addStringToBuffer: (text: string, referencePosition: number) => AstBufferForWriting<T>;
	byteBuffer: T;
	position: number;
	reserve: (size: number) => AstBufferForWriting<T>;
	toOutput: () => T;
	writeFloat64: (value: number, wordPosition: number) => void;
}

// Buffers hold 32-bit words in host byte order. For words that represent
// strings, the four string bytes are packed LSB-first into the word, which on
// little-endian hosts leaves the raw encoded string bytes in memory while
// big-endian hosts need the byte order of each word reversed.
const isBigEndianHost = new Uint8Array(new Uint32Array([1]).buffer)[0] === 0;

const scratchFloat64 = new DataView(new ArrayBuffer(8));
let scratchStringBytes = new Uint8Array(0);

const writeFloat64 = function (this: Uint32Array, value: number, wordPosition: number): void {
	scratchFloat64.setFloat64(0, value, true);
	this[wordPosition] = scratchFloat64.getUint32(0, true);
	this[wordPosition + 1] = scratchFloat64.getUint32(4, true);
};

function writeStringWordsBigEndian(
	buffer: AstBufferForWriting,
	byteBuffer: Uint8Array | Buffer,
	bytePosition: number,
	byteLength: number
): void {
	const firstWordPosition = bytePosition >> 2;
	const wordCount = (byteLength + 3) >> 2;
	for (let index = 0; index < wordCount; index++) {
		const offset = bytePosition + (index << 2);
		buffer[firstWordPosition + index] =
			byteBuffer[offset] |
			(byteBuffer[offset + 1] << 8) |
			(byteBuffer[offset + 2] << 16) |
			(byteBuffer[offset + 3] << 24);
	}
}

const expandPackedString = (array: Uint32Array, position: number, length: number): Uint8Array => {
	const paddedByteLength = ((length + 3) >> 2) << 2;
	if (scratchStringBytes.length < paddedByteLength) {
		scratchStringBytes = new Uint8Array(paddedByteLength);
	}
	const firstStringWord = position + 1;
	for (let index = 0; index < paddedByteLength >> 2; index++) {
		const word = array[firstStringWord + index];
		scratchStringBytes[index << 2] = word & 0xff;
		scratchStringBytes[(index << 2) + 1] = (word >>> 8) & 0xff;
		scratchStringBytes[(index << 2) + 2] = (word >>> 16) & 0xff;
		scratchStringBytes[(index << 2) + 3] = (word >>> 24) & 0xff;
	}
	return scratchStringBytes.subarray(0, length);
};

const decodePackedString = (array: Uint32Array, position: number, length: number): string => {
	const bytes = expandPackedString(array, position, length);
	return typeof Buffer !== 'undefined'
		? Buffer.from(bytes.buffer, bytes.byteOffset, bytes.length).toString('utf8')
		: new TextDecoder().decode(bytes);
};

export function getAstBuffer(byteBuffer: Buffer | Uint8Array): AstBuffer {
	// Create an aligned copy for misaligned views, e.g. buffers restored by
	// v8.deserialize, as the Uint32Array below requires a 4-byte aligned offset
	const alignedByteBuffer = byteBuffer.byteOffset & 3 ? new Uint8Array(byteBuffer) : byteBuffer;
	const array = new Uint32Array(
		alignedByteBuffer.buffer,
		alignedByteBuffer.byteOffset,
		alignedByteBuffer.byteLength >> 2
	);
	let convertString: (position: number) => string;
	if (isBigEndianHost) {
		convertString = position => decodePackedString(array, position, array[position]);
	} else if (typeof Buffer !== 'undefined' && byteBuffer instanceof Buffer) {
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
	return Object.assign(array, {
		convertFloat64(this: AstBuffer, position: number) {
			scratchFloat64.setUint32(0, this[position], true);
			scratchFloat64.setUint32(4, this[position + 1], true);
			return scratchFloat64.getFloat64(0, true);
		},
		convertString
	});
}

export function createAstBufferUint8(uInt32Size: number): AstBufferForWriting<Uint8Array> {
	const buffer = new Uint32Array(uInt32Size) as AstBufferForWriting<Uint8Array>;
	const encoder = new TextEncoder();
	const byteBuffer = new Uint8Array(buffer.buffer);
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
			const stringBytePosition = (insertPosition + 1) << 2;
			extendedBuffer.byteBuffer.set(encoded, stringBytePosition);
			if (isBigEndianHost) {
				writeStringWordsBigEndian(
					extendedBuffer,
					extendedBuffer.byteBuffer,
					stringBytePosition,
					encodedByteLength
				);
			}
			return extendedBuffer;
		},
		byteBuffer,
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
			return byteBuffer.slice(0, byteSize);
		},
		writeFloat64
	} satisfies AstBufferForWritingApi<Uint8Array>);
}

export function createAstBufferNode(uInt32Size: number): AstBufferForWriting<Buffer> {
	const buffer = new Uint32Array(uInt32Size) as AstBufferForWriting<Buffer>;
	const byteBuffer = Buffer.from(buffer.buffer);
	return Object.assign(buffer, {
		addStringToBuffer(text, referencePosition) {
			let extendedBuffer = buffer;
			const requiredSize = buffer.position + 1 + ((text.length * 3 + 3) >> 2);
			if (requiredSize > buffer.length) {
				// Reserve more space if needed
				extendedBuffer = createAstBufferNode(requiredSize * 2);
				byteBuffer.copy(extendedBuffer.byteBuffer, 0, 0, buffer.position << 2);
				extendedBuffer.position = buffer.position;
			}
			const insertPosition = extendedBuffer.position;
			extendedBuffer[referencePosition] = insertPosition;
			const stringBytePosition = (insertPosition + 1) << 2;
			const encodedLength = extendedBuffer.byteBuffer.write(text, stringBytePosition);
			extendedBuffer[insertPosition] = encodedLength;
			if (isBigEndianHost) {
				writeStringWordsBigEndian(
					extendedBuffer,
					extendedBuffer.byteBuffer,
					stringBytePosition,
					encodedLength
				);
			}
			// Round up to the next 4-byte boundary
			extendedBuffer.position = (stringBytePosition + encodedLength + 3) >> 2;
			return extendedBuffer;
		},
		byteBuffer,
		position: 0,
		reserve(size) {
			const newPosition = buffer.position + size;
			if (newPosition <= buffer.length) {
				buffer.position = newPosition;
				return buffer;
			}
			const newBuffer = createAstBufferNode(newPosition * 2);
			byteBuffer.copy(newBuffer.byteBuffer, 0, 0, buffer.position << 2);
			newBuffer.position = newPosition;
			return newBuffer;
		},
		toOutput() {
			const byteSize = buffer.position << 2;
			// The "slow" version will allocate exactly the needed size and is preferable
			// for long-term memory usage.
			const truncatedBuffer = Buffer.allocUnsafeSlow(byteSize);
			byteBuffer.copy(truncatedBuffer, 0, 0, byteSize);
			return truncatedBuffer;
		},
		writeFloat64
	} satisfies AstBufferForWritingApi<Buffer>);
}
