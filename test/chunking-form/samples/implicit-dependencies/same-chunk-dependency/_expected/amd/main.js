define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-lib'], resolve, reject) }).then(function (n) { return n.lib; });

});
