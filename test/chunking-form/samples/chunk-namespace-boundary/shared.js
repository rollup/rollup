import * as commonjsHelpers from './commonjsHelpers';

commonjsHelpers.commonjsGlobal.data = [4, 5, 6];
var shared = commonjsHelpers.commonjsGlobal.data;

export default shared;
export { shared as __moduleExports };
