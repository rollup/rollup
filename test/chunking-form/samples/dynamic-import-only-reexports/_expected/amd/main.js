define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-chunk.js'], resolve, reject) }).then(({ value }) => console.log(value));

});
