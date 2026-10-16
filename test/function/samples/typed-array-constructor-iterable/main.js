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

new Float32Array(iterable);
new Float64Array(iterable);
new Int16Array(iterable);
new Int32Array(iterable);
new Int8Array(iterable);
new Uint16Array(iterable);
new Uint32Array(iterable);
new Uint8Array(iterable);
new Uint8ClampedArray(iterable);

const arrayWithIterator = [];
arrayWithIterator[Symbol.iterator] = function () {
	effects++;
	return [][Symbol.iterator].call(this);
};
new Uint8Array(arrayWithIterator);

new Uint8Array({
	get length() {
		effects++;
		return 0;
	}
});

assert.equal(effects, 11);
