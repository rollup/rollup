import { getDefaultExportFromCjs } from './rollup_virtual/_commonjsHelpers.js';
import { __require as requireMain } from './main2.js';

var mainExports = requireMain();
var main = /*@__PURE__*/getDefaultExportFromCjs(mainExports);

export { main as default };
