define(['require'], (function (require) { 'use strict';

  // Using dynamic imports for clearer expected output
  const load = async () => {
    console.log(
      await new Promise(function (resolve, reject) { require(['./generated-manual'], resolve, reject); }).then(function (n) { return n.manual1; }).then((m) => m.manual1),
      await new Promise(function (resolve, reject) { require(['./generated-manual'], resolve, reject); }).then(function (n) { return n.manual2; }).then((m) => m.manual2),
    );
  };
  load();

  console.log('main');

}));
