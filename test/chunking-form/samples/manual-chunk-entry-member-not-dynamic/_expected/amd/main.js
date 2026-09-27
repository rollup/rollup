define(['require'], (function (require) { 'use strict';

	const X = 'x';

	new Promise(function (resolve, reject) { require(['./generated-manual'], resolve, reject); }).then(function (n) { return n.mB; }).then(m => console.log(m.MB, m.OTHER, X));

}));
