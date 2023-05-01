import { getDefaultExportFromCjs } from './_virtual/_commonjsHelpers.js';
import './custom_modules/@my-scope/my-base-pkg/index.js';
import { __exports as myBasePkg } from './_virtual/index.js';

const base = myBasePkg;

var underBuild = {
	base
};

var underBuild$1 = /*@__PURE__*/getDefaultExportFromCjs(underBuild);

export { underBuild$1 as default };
