module.exports = defineTest({
description: 'dynamic import inside async function should not cause spurious cycle warning when module has top-level await',
options: {
output: {
inlineDynamicImports: true
}
}
// No expectedWarnings - the dynamic import is inside an async function,
// not at the top level, so it should NOT be treated as synchronous
});
