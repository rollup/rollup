define(['require'], (function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject); }).then(({ value }) => console.log(value));

}));
