import { getDefaultExportFromCjs } from '../_virtual/_commonjsHelpers.js';
import '../custom_modules/@my-scope/my-base-pkg/index.js';
import { __exports as myBasePkg } from '../_virtual/index.js';

const base2 = myBasePkg;

var module = {
  base2,
};

var module$1 = /*@__PURE__*/getDefaultExportFromCjs(module);

export { module$1 as default };
