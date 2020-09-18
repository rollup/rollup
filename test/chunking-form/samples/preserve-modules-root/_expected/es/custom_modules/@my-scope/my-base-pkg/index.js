import { createCommonjsModule } from '../../../_virtual/_commonjsHelpers.js';

var myBasePkg = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', { value: true });

var hello = 'world';

exports.hello = hello;
});

export { myBasePkg as m };
