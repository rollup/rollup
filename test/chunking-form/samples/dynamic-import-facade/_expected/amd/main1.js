define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) }).then(function (n) { return n.dynamic$1; }).then(({dynamic}) => console.log('main1', dynamic));

});
