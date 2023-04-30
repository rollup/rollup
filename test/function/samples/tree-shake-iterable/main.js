let effects = 0;

const iterable = {
	[Symbol.iterator]() {
		return {
			next() {
				effects++;
				return { done: true };
			}
		};
	}
};

new Map(iterable);
new Set(iterable);
new WeakMap(iterable);
new WeakSet(iterable);
Array.from(iterable);
BigInt64Array.from(iterable);
BigUint64Array.from(iterable);
Float32Array.from(iterable);
Float64Array.from(iterable);
Int16Array.from(iterable);
Int32Array.from(iterable);
Int8Array.from(iterable);
Uint16Array.from(iterable);
Uint32Array.from(iterable);
Uint8Array.from(iterable);
Uint8ClampedArray.from(iterable);
Object.fromEntries(iterable);

assert.equal(effects, 17);
