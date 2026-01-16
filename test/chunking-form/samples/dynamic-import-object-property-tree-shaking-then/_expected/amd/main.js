define(['require'], (function (require) { 'use strict';

  new Promise(function (resolve, reject) { require(['./generated-dep'], resolve, reject); }).then(({ obj }) => {
    console.log(obj.a);
  });

}));
