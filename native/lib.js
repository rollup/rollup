// eslint-disable-next-line unicorn/prevent-abbreviations
module.exports = require('./rollup.node');
// Only for dev this file is just copied. For production, we should write a file
// based on the one created by rs-napi. Probably a try-catch wrapping something
// that requires/uses createRequire based on an object where the keys are
// platforms and the values are objects where the keys are archs and the values
// are file names.
