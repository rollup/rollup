//→ main.js:
define('foo/main', ['require', 'exports'], function (require, exports) { 'use strict';

  function getA() {
    return new Promise(function (resolve, reject) { require(['./a-44b1f428'], resolve, reject) });
  }

  exports.getA = getA;

  Object.defineProperty(exports, '__esModule', { value: true });

});

//→ a-44b1f428.js:
define('foo/a-44b1f428', ['exports'], function (exports) { 'use strict';

	const something = 42;

	exports.something = something;

});
