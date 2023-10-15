const { parse, xxhashBase64Url } = require('./wasm-node/bindings_wasm.js');

exports.parse = parse;
exports.xxhashBase64Url = xxhashBase64Url;
