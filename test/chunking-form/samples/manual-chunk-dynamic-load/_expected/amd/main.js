define(['require', 'exports'], (function (require, exports) { 'use strict';

	const DEP = 'DEP';

	new Promise(function (resolve, reject) { require(['./generated-m'], resolve, reject); }).then(m => console.log(m, DEP));

	exports.DEP = DEP;

}));
