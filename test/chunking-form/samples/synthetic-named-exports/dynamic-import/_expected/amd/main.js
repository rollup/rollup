define(['require'], (function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-dep'], resolve, reject); }).then(function (n) { return n.dep; }).then(({ foo, bar, baz }) => console.log(foo, bar, baz));

}));
