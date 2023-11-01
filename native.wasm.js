const { parse, xxhashBase64Url } = require('./wasm-node/bindings_wasm.js');

exports.parse = parse;
exports.parseAsync = async (code, allowReturnOutsideFunction, _signal) =>
	parse(code, allowReturnOutsideFunction);
exports.xxhashBase64Url = xxhashBase64Url;
