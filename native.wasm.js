const {
	parse,
	xxhashBase64Url,
	xxhashBase36,
	xxhashBase16
} = require('./wasm-node/bindings_wasm.js');

// WebAssembly is always little-endian while the buffer is read in the byte
// order of the host, so on big-endian hosts the parser swaps the byte order
// of the 32-bit fields.
const swapByteOrder = new Uint8Array(new Uint32Array([1]).buffer)[0] === 0;

exports.parse = (code, allowReturnOutsideFunction, jsx) =>
	parse(code, allowReturnOutsideFunction, jsx, swapByteOrder);
exports.parseAsync = async (code, allowReturnOutsideFunction, jsx, _signal) =>
	parse(code, allowReturnOutsideFunction, jsx, swapByteOrder);
exports.xxhashBase64Url = xxhashBase64Url;
exports.xxhashBase36 = xxhashBase36;
exports.xxhashBase16 = xxhashBase16;
// WASM builds don't collect LLVM coverage. This no-op keeps exports in sync
// with native.js, where flushLlvmCoverage only exists in coverage builds.
exports.flushLlvmCoverage = () => {};
