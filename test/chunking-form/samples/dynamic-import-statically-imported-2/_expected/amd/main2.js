define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-chunk2'], resolve, reject) }).then(({ bar }) => console.log(bar()));

});
