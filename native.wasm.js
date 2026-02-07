const {
	parse,
	parseAndWalkSync,
	xxhashBase64Url,
	xxhashBase36,
	xxhashBase16
} = require('./wasm-node/bindings_wasm.js');

exports.parse = parse;
exports.parseAsync = async (code, allowReturnOutsideFunction, jsx, _signal) =>
	parse(code, allowReturnOutsideFunction, jsx);
exports.parseAndWalk = async (code, allowReturnOutsideFunction, jsx, nodeBitset, _signal) =>
	parseAndWalkSync(code, allowReturnOutsideFunction, jsx, nodeBitset);
exports.xxhashBase64Url = xxhashBase64Url;
exports.xxhashBase36 = xxhashBase36;
exports.xxhashBase16 = xxhashBase16;
