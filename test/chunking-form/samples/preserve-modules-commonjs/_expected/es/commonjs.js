import { getDefaultExportFromCjs } from './_virtual/_commonjsHelpers.js';
import require$$0 from 'external';
import './other.js';
import { __exports as other } from './_virtual/other.js';

const external = require$$0;
const { value } = other;

console.log(external, value);

var commonjs = 42;

var value$1 = /*@__PURE__*/getDefaultExportFromCjs(commonjs);

export { value$1 as default };
