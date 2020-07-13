var myBundle = (function (exports, a, Test$1) {
  'use strict';

  function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

  var Test__default = _interopDefault(Test$1);

  const Test = () => {
    console.log(a.Test);
  };

  const Test1 = () => {
    console.log(Test__default['default']);
  };

  exports.Test = Test;
  exports.Test1 = Test1;

  return exports;

}({}, a, b));
