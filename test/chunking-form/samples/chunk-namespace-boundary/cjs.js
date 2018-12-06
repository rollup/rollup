import * as commonjsHelpers from './commonjsHelpers';

commonjsHelpers.commonjsGlobal.fn = d => d + 1;
var cjs = commonjsHelpers.commonjsGlobal.fn;

export default cjs;
export { cjs as __moduleExports };
