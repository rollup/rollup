const {
	parse,
	parseAndWalkSync,
	xxhashBase64Url,
	xxhashBase36,
	xxhashBase16
} = require('./wasm-node/bindings_wasm.js');

// WebAssembly always emits little-endian words while all words of the returned
// buffers are read in host byte order, so on big-endian hosts swap each whole
// buffer once here. The wasm-bindgen glue hands over a fresh JS-owned copy,
// which is always 32-bit aligned, making this in-place swap safe.
const isBigEndianHost = new Uint8Array(new Uint32Array([1]).buffer)[0] === 0;
const toHostByteOrder = result => {
	if (isBigEndianHost) {
		Buffer.from(result.buffer, result.byteOffset, result.byteLength).swap32();
	}
	return result;
};

exports.parse = (code, allowReturnOutsideFunction, jsx) =>
	toHostByteOrder(parse(code, allowReturnOutsideFunction, jsx));
exports.parseAsync = async (code, allowReturnOutsideFunction, jsx) =>
	toHostByteOrder(parse(code, allowReturnOutsideFunction, jsx));
exports.parseAndWalk = async (
	code,
	allowReturnOutsideFunction,
	jsx,
	walkedNodesBitset,
	collectScopes
) =>
	toHostByteOrder(
		parseAndWalkSync(code, allowReturnOutsideFunction, jsx, walkedNodesBitset, collectScopes)
	);
exports.xxhashBase64Url = xxhashBase64Url;
exports.xxhashBase36 = xxhashBase36;
exports.xxhashBase16 = xxhashBase16;
// WASM builds don't collect LLVM coverage. This no-op keeps exports in sync
// with native.js, where flushLlvmCoverage only exists in coverage builds.
exports.flushLlvmCoverage = () => {};
