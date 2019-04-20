define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-chunk'], resolve, reject) }).then(({ value }) => console.log(value));

});
