define(['require'], (function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject); }).then(({DYNAMIC_USED_BY_A}) => console.log(DYNAMIC_USED_BY_A));

}));
