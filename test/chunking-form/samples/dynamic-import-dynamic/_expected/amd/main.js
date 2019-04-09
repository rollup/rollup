define(['require'], function (require) { 'use strict';

	var dep = 'dep';

	new Promise(function (resolve, reject) { require([dep], resolve, reject) });

});
