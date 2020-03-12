import 'external';
import external$1 from './_virtual/_external_commonjs-external';
import require$$0 from './_virtual/other.js_commonjs-proxy';

const { value } = require$$0;

console.log(external$1, value);

var commonjs = 42;

export default commonjs;
export { commonjs as __moduleExports };
