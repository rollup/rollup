define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./foo'], resolve, reject) }).then(result => console.log(result));

});
