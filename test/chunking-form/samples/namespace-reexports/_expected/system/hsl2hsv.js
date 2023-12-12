System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      var hsl2hsv = exports('default', (h, s, l) => {
        const t = s * (l < 0.5 ? 1 : 1 - l),
          V = 1 + t,
          S = 2 * t / V ;
        return [h, S, V];
      });

      var p = exports("p", 5);

    })
  };
}));
