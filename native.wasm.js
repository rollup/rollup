const {
	parse,
	xxhashBase64Url,
	xxhashBase36,
	xxhashBase16
} = require('./wasm-node/bindings_wasm.js');

exports.parse = parse;
exports.parseAsync = async (code, allowReturnOutsideFunction, jsx, _signal) =>
	parse(code, allowReturnOutsideFunction, jsx);
exports.xxhashBase64Url = xxhashBase64Url;
exports.xxhashBase36 = xxhashBase36;
exports.xxhashBase16 = xxhashBase16;
// Only present in coverage builds (cfg(coverage)). WASM builds don't collect
// LLVM coverage, so this is a no-op to keep exports in sync with native.js.
exports.flushLlvmCoverage = () => {};
