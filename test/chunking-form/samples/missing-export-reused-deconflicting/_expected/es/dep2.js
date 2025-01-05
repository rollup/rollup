var _missingExportShim = void 0;

console.log('This is the output when a missing export is reexported');

var _missingExportShim$1 = undefined;

console.log(_missingExportShim$1);

export { _missingExportShim as missing2, _missingExportShim$1 as previousShimmedExport };
