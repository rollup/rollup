define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-dep12'], resolve, reject) }).then(({ bar }) => console.log(bar()));

});
